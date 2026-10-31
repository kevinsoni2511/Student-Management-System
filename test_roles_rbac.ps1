# Test Script for All 10 User Roles & Backend 403 Authorization
$baseUrl = "http://127.0.0.1:8000/api"

$roles = @(
    @{ Role = "super_admin"; Email = "superadmin@example.com"; Pass = "admin123"; ExpectedDashboard = "/super-admin/dashboard"; OwnApi = "/super-admin/overview" },
    @{ Role = "admin"; Email = "admin@example.com"; Pass = "admin123"; ExpectedDashboard = "/admin/dashboard"; OwnApi = "/dashboard/statistics" },
    @{ Role = "principal"; Email = "principal@example.com"; Pass = "principal123"; ExpectedDashboard = "/principal/dashboard"; OwnApi = "/principal/overview" },
    @{ Role = "teacher"; Email = "teacher@example.com"; Pass = "teacher123"; ExpectedDashboard = "/teacher/dashboard"; OwnApi = "/teacher/dashboard-data" },
    @{ Role = "accountant"; Email = "accountant@example.com"; Pass = "account123"; ExpectedDashboard = "/accountant/dashboard"; OwnApi = "/accountant/dashboard-data" },
    @{ Role = "receptionist"; Email = "receptionist@example.com"; Pass = "recept123"; ExpectedDashboard = "/receptionist/dashboard"; OwnApi = "/receptionist/dashboard-data" },
    @{ Role = "librarian"; Email = "librarian@example.com"; Pass = "library123"; ExpectedDashboard = "/librarian/dashboard"; OwnApi = "/librarian/dashboard-data" },
    @{ Role = "transport_manager"; Email = "transport@example.com"; Pass = "transport123"; ExpectedDashboard = "/transport/dashboard"; OwnApi = "/transport/dashboard-data" },
    @{ Role = "parent"; Email = "parent@example.com"; Pass = "parent123"; ExpectedDashboard = "/parent/dashboard"; OwnApi = "/parent/dashboard-data" },
    @{ Role = "student"; Email = "student@example.com"; Pass = "student123"; ExpectedDashboard = "/student/dashboard"; OwnApi = "/student/dashboard-data" }
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "STAGE 1: VERIFYING LOGIN & AUTHORIZED API FOR ALL 10 ROLES" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$tokens = @{}

foreach ($r in $roles) {
    $loginBody = @{ email = $r.Email; password = $r.Pass } | ConvertTo-Json
    try {
        $loginRes = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json"
        if ($loginRes.token -and $loginRes.user.role -eq $r.Role) {
            Write-Host "[PASS] Login: $($r.Role) ($($r.Email)) => Role '$($loginRes.user.role)' verified." -ForegroundColor Green
            $tokens[$r.Role] = $loginRes.token
            
            # Test authorized API
            $headers = @{ "Authorization" = "Bearer $($loginRes.token)"; "Accept" = "application/json" }
            $ownRes = Invoke-RestMethod -Uri "$baseUrl$($r.OwnApi)" -Method Get -Headers $headers
            if ($ownRes.success -or $ownRes.statistics -or $ownRes.data) {
                Write-Host "       [PASS] Authorized API $($r.OwnApi) returned 200 OK." -ForegroundColor Green
            } else {
                Write-Host "       [FAIL] Authorized API $($r.OwnApi) did not return success." -ForegroundColor Red
            }
        } else {
            Write-Host "[FAIL] Login failed for $($r.Role): unexpected response" -ForegroundColor Red
        }
    } catch {
        Write-Host "[FAIL] Login error for $($r.Role): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "STAGE 2: VERIFYING BACKEND 403 FORBIDDEN ON UNAUTHORIZED ACCESS" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Test 1: Teacher attempting to access Super Admin API (/api/super-admin/overview) -> MUST BE 403
$teacherHeaders = @{ "Authorization" = "Bearer $($tokens['teacher'])"; "Accept" = "application/json" }
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/super-admin/overview" -Method Get -Headers $teacherHeaders
    Write-Host "[SECURITY BREACH] Teacher accessed Super Admin API!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "[PASS 403] Teacher blocked from /api/super-admin/overview (HTTP 403 Forbidden)." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Teacher got HTTP $statusCode instead of 403" -ForegroundColor Yellow
    }
}

# Test 2: Teacher attempting to access Fees Structure API (/api/fees/structures) -> MUST BE 403
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/fees/structures" -Method Get -Headers $teacherHeaders
    Write-Host "[SECURITY BREACH] Teacher accessed Fee Structures API!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "[PASS 403] Teacher blocked from Fee Management /api/fees/structures (HTTP 403 Forbidden)." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Teacher got HTTP $statusCode instead of 403" -ForegroundColor Yellow
    }
}

# Test 3: Accountant attempting to access Super Admin or create class -> MUST BE 403
$accountantHeaders = @{ "Authorization" = "Bearer $($tokens['accountant'])"; "Accept" = "application/json" }
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/super-admin/overview" -Method Get -Headers $accountantHeaders
    Write-Host "[SECURITY BREACH] Accountant accessed Super Admin API!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "[PASS 403] Accountant blocked from /api/super-admin/overview (HTTP 403 Forbidden)." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Accountant got HTTP $statusCode instead of 403" -ForegroundColor Yellow
    }
}

# Test 4: Student attempting to access Admin Permissions -> MUST BE 403
$studentHeaders = @{ "Authorization" = "Bearer $($tokens['student'])"; "Accept" = "application/json" }
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/admin/permissions" -Method Get -Headers $studentHeaders
    Write-Host "[SECURITY BREACH] Student accessed Admin Permissions!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "[PASS 403] Student blocked from Admin Permissions /api/admin/permissions (HTTP 403 Forbidden)." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Student got HTTP $statusCode instead of 403" -ForegroundColor Yellow
    }
}

# Test 5: Parent attempting to access unauthorized child (e.g. Student ID 9999 or unlinked student) -> MUST BE 403
$parentHeaders = @{ "Authorization" = "Bearer $($tokens['parent'])"; "Accept" = "application/json" }
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/parent/child/9999" -Method Get -Headers $parentHeaders
    Write-Host "[SECURITY BREACH] Parent accessed unlinked student ID!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "[PASS 403] Parent blocked from viewing unlinked child record (HTTP 403 Forbidden)." -ForegroundColor Green
    } else {
        Write-Host "[INFO] Status for unlinked child: HTTP $statusCode" -ForegroundColor Yellow
    }
}

Write-Host "`nAll RBAC Authentication & Authorization security tests completed!" -ForegroundColor Cyan

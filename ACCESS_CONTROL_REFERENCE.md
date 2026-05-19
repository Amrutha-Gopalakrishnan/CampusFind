# Quick Reference: Access Control

## 🔐 Email-Role Mapping

| Email | Role | Access |
|-------|------|--------|
| `amruthagopal16@gmail.com` | Admin | ✅ Full admin dashboard + all features |
| `ammugopal1116@gmail.com` | Faculty | ✅ All standard features (no admin) |
| All other emails | Student | ✅ All standard features (no admin) |

## 🛡️ Protection Layers

### 1. **Login/Signup Validation** (LogSignup.jsx)
```javascript
// Before any Supabase call
const validation = validateEmailForUserType(email, userType);
if (!validation.valid) {
  return; // STOP - No database operation
}
```

### 2. **Route Protection** (App.jsx)
```javascript
<AdminRoute user={user}>
  <AdminDashboard />
</AdminRoute>
```

### 3. **Content Guard** (Dashboard.jsx)
```javascript
if (active === "admin" && !isAdminUser(user)) {
  toast.error("Access Denied");
  // Redirect to default view
}
```

### 4. **UI Visibility** (Sidebar.jsx)
```javascript
const visibleMenuItems = menuItems.filter(item => {
  if (item.adminOnly) return isAdminUser(user);
  return true;
});
```

### 5. **Component Guard** (AdminDashBoard.jsx)
```javascript
useEffect(() => {
  if (!isAdminUser(user)) {
    navigate("/dashboard");
  }
}, [user]);
```

## 📝 Common Functions

### Check User Role
```javascript
import { isAdminUser, isFacultyUser, isStudentUser } from './utils/accessControl';

if (isAdminUser(user)) {
  // Admin-specific code
}

if (isFacultyUser(user)) {
  // Faculty-specific code
}

if (isStudentUser(user)) {
  // Student-specific code
}
```

### Validate Email Before Auth
```javascript
import { validateEmailForUserType } from './utils/accessControl';

const validation = validateEmailForUserType(email, "admin");
if (!validation.valid) {
  showError(validation.message);
  return; // Stop execution
}

// Proceed with Supabase operations
await supabase.auth.signUp({ email, password });
```

### Determine Role from Email
```javascript
import { determineRoleFromEmail } from './utils/accessControl';

const role = determineRoleFromEmail("amruthagopal16@gmail.com");
// Returns: "admin"
```

## 🎯 Key Points

1. ✅ **All validation happens in JavaScript** - BEFORE any database calls
2. ✅ **No SQL modifications** - Existing queries remain unchanged
3. ✅ **Multiple protection layers** - Defense in depth approach
4. ✅ **Early returns** - Stop execution immediately on validation failure
5. ✅ **Clear error messages** - User-friendly feedback
6. ✅ **Centralized control** - Use utility functions from `accessControl.js`

## 🔄 Update Email Restrictions

To change allowed emails, update constants in:
- `src/utils/accessControl.js`

Then reimport in:
- `LogSignup.jsx`
- `App.jsx`
- `Dashboard.jsx`
- `Sidebar.jsx`
- `AdminDashBoard.jsx`

## ⚠️ Important Rules

### ❌ DO NOT
- Modify SQL queries
- Change database constraints
- Rely on database for validation
- Skip validation checks

### ✅ DO
- Validate emails BEFORE Supabase calls
- Use early returns on validation failure
- Show clear error messages
- Keep validation logic in code

## 🧪 Test Cases

| Scenario | Email | User Type | Expected Result |
|----------|-------|-----------|-----------------|
| Admin signup | `amruthagopal16@gmail.com` | Student/Faculty | ❌ Error: Email reserved |
| Admin login | `amruthagopal16@gmail.com` | Admin | ✅ Success, admin dashboard visible |
| Faculty signup | `ammugopal1116@gmail.com` | Student | ❌ Error: Email reserved |
| Faculty login | `ammugopal1116@gmail.com` | Faculty | ✅ Success, no admin dashboard |
| Student signup | `student@srcas.ac.in` | Student | ✅ Success, no admin dashboard |
| Wrong admin | `other@email.com` | Admin | ❌ Error: Admin access restricted |
| Wrong faculty | `other@email.com` | Faculty | ❌ Error: Faculty access restricted |

## 📞 Support

For questions or issues, check:
- `AUTHENTICATION_IMPLEMENTATION.md` - Full implementation details
- `src/utils/accessControl.js` - Utility functions
- Console logs for validation errors

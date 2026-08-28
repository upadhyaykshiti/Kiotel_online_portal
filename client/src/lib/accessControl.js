// // // src/lib/accessControl.js
// // export const getRoleName = (roleId) => {
// //   if (roleId === 1) return 'admin';
// //   if (roleId === 5) return 'hr';
// //   return 'employee';
// // };

// // export const hasPermission = (roleId, permission) => {
// //   const roleName = getRoleName(roleId);
  
// //   const permissions = {
// //     // Admin permissions (role_id: 1)
// //     CREATE_SCHEDULE: [1, 5], // Admin and HR
// //     EDIT_SCHEDULE: [1, 5],   // Admin and HR
// //     PUBLISH_SCHEDULE: [1],   // Admin only
// //     ASSIGN_SHIFTS: [1, 5],   // Admin and HR
// //     MANAGE_PROPERTIES: [1, 5], // Admin and HR
// //     APPROVE_CHANGES: [5],    // HR only
    
// //     // Employee permissions (all roles)
// //     VIEW_OWN_SCHEDULE: [1, 5, 2, 3, 4, 6, 7, 8, 9, 10], // All roles
// //     REQUEST_SHIFT_CHANGE: [2, 3, 4, 6, 7, 8, 9, 10], // Non-admin/HR roles
// //     MARK_AVAILABILITY: [2, 3, 4, 6, 7, 8, 9, 10]     // Non-admin/HR roles
// //   };

// //   return permissions[permission]?.includes(roleId) || false;
// // };


// // src/lib/accessControl.js

// // ✅ Define all permissions here
// export const PERMISSIONS = {
//   CREATE_SCHEDULE: 'CREATE_SCHEDULE',
//   EDIT_SCHEDULE: 'EDIT_SCHEDULE',
//   PUBLISH_SCHEDULE: 'PUBLISH_SCHEDULE',
//   ASSIGN_SHIFTS: 'ASSIGN_SHIFTS',
//   MANAGE_PROPERTIES: 'MANAGE_PROPERTIES',
//   APPROVE_CHANGES: 'APPROVE_CHANGES',
//   VIEW_OWN_SCHEDULE: 'VIEW_OWN_SCHEDULE',
//   REQUEST_SHIFT_CHANGE: 'REQUEST_SHIFT_CHANGE',
//   MARK_AVAILABILITY: 'MARK_AVAILABILITY'
// };

// // ✅ Helper: convert role_id → readable role name
// export const getRoleName = (roleId) => {
//   if (roleId === 1) return 'admin';
//   if (roleId === 5) return 'hr';
//   return 'employee';
// };

// // ✅ Permission check helper
// export const hasPermission = (roleId, permission) => {
//   const roleName = getRoleName(roleId);

//   const rolePermissions = {
//     [PERMISSIONS.CREATE_SCHEDULE]: [1, 5], // Admin & HR
//     [PERMISSIONS.EDIT_SCHEDULE]: [1, 5],
//     [PERMISSIONS.PUBLISH_SCHEDULE]: [1],
//     [PERMISSIONS.ASSIGN_SHIFTS]: [1, 5],
//     [PERMISSIONS.MANAGE_PROPERTIES]: [1, 5],
//     [PERMISSIONS.APPROVE_CHANGES]: [5],
//     [PERMISSIONS.VIEW_OWN_SCHEDULE]: [1, 5, 2, 3, 4, 6, 7, 8, 9, 10],
//     [PERMISSIONS.REQUEST_SHIFT_CHANGE]: [2, 3, 4, 6, 7, 8, 9, 10],
//     [PERMISSIONS.MARK_AVAILABILITY]: [2, 3, 4, 6, 7, 8, 9, 10],
//   };

//   return rolePermissions[permission]?.includes(roleId) || false;
// };


// src/lib/accessControl.js

export const PERMISSIONS = {
  CREATE_SCHEDULE: 'CREATE_SCHEDULE',
  EDIT_SCHEDULE: 'EDIT_SCHEDULE',
  PUBLISH_SCHEDULE: 'PUBLISH_SCHEDULE',
  ASSIGN_SHIFTS: 'ASSIGN_SHIFTS',
  MANAGE_PROPERTIES: 'MANAGE_PROPERTIES',
  APPROVE_CHANGES: 'APPROVE_CHANGES',
  VIEW_OWN_SCHEDULE: 'VIEW_OWN_SCHEDULE',
  REQUEST_SHIFT_CHANGE: 'REQUEST_SHIFT_CHANGE',
  MARK_AVAILABILITY: 'MARK_AVAILABILITY',
};

export const getRoleName = (roleId) => {
  if (roleId === 1) return 'admin';
  if (roleId === 5) return 'hr';
  return 'employee';
};

export const hasPermission = (roleId, permission) => {
  const permissions = {
    CREATE_SCHEDULE: [1, 5], // Admin + HR
    EDIT_SCHEDULE: [1, 5],
    PUBLISH_SCHEDULE: [1],
    ASSIGN_SHIFTS: [1, 5],
    MANAGE_PROPERTIES: [1, 5],
    APPROVE_CHANGES: [5], // HR only
    VIEW_OWN_SCHEDULE: [1, 5, 2, 3, 4, 6, 7, 8, 9, 10],
    REQUEST_SHIFT_CHANGE: [2, 3, 4, 6, 7, 8, 9, 10],
    MARK_AVAILABILITY: [2, 3, 4, 6, 7, 8, 9, 10],
  };

  return permissions[permission]?.includes(roleId) || false;
};

export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({
                success: false,
                msg: "Access Denied: No roles assigned"
            });
        }

        const userRoles = req.user.roles;

        // Super Admin bypasses all checks
        if (userRoles.includes("super_admin")) {
            return next();
        }

        const hasAccess = allowedRoles.some(role => userRoles.includes(role));

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                msg: `Access Denied: Required one of [${allowedRoles.join(", ")}] roles`
            });
        }

        next();
    };
};

export const isOrgAdmin = checkRole(["org_admin"]);
export const isManager = checkRole(["org_admin", "manager"]);
export const isEmployee = checkRole(["org_admin", "manager", "employee"]);
export const isViewer = checkRole(["org_admin", "manager", "employee", "viewer"]);

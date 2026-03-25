
const isAdmin = async (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.includes("admin")) {
        return res.status(403).json({ success: false, msg: "Access denied. Admins only." });
    }
    next();
};

export default isAdmin;

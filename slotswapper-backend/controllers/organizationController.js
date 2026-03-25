import Organization from "../models/Organization.js";

// @desc    Get organization details & policies
// @route   GET /api/organization/settings
// @access  Private (Org Admin)
export const getSettings = async (req, res) => {
    try {
        const organization = await Organization.findById(req.user.organization);

        if (!organization) {
            return res.status(404).json({ success: false, msg: "Organization not found" });
        }

        res.json({
            success: true,
            data: {
                id: organization._id,
                name: organization.name,
                organizationKey: organization.organizationKey,
                domain: organization.domain,
                allowedDomains: organization.allowedDomains,
                isDomainRestricted: organization.isDomainRestricted,
                policies: organization.policies,
                branding: organization.branding,
                subscription: organization.subscription
            }
        });
    } catch (err) {
        console.error("[GetOrgSettings] Error:", err);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

// @desc    Update organization policies & branding
// @route   PATCH /api/organization/settings
// @access  Private (Org Admin)
export const updateSettings = async (req, res) => {
    try {
        const { policies, branding, isDomainRestricted, allowedDomains } = req.body;

        const organization = await Organization.findById(req.user.organization);

        if (!organization) {
            return res.status(404).json({ success: false, msg: "Organization not found" });
        }

        if (policies) organization.policies = { ...organization.policies, ...policies };
        if (branding) organization.branding = { ...organization.branding, ...branding };
        if (isDomainRestricted !== undefined) organization.isDomainRestricted = isDomainRestricted;
        if (allowedDomains) organization.allowedDomains = allowedDomains;

        await organization.save();

        res.json({
            success: true,
            data: organization,
            msg: "Organization updated successfully"
        });

    } catch (err) {
        console.error("[UpdateOrgSettings] Error:", err);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

import Event from "../models/Event.js";
import User from "../models/User.js";
import NodeCache from "node-cache";

class SwapEngine {
    constructor() {
        // Cache analysis results for 1 hour, check expiry every 2 minutes
        this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
    }

    /**
     * Calculates compatibility score between a requester and the target event
     */
    async analyzeCompatibility(requesterId, eventId) {
        if (!requesterId || !eventId) return { score: 0, reason: "Missing data" };

        const cacheKey = `analysis_${requesterId}_${eventId}`;
        const cachedResult = this.cache.get(cacheKey);

        if (cachedResult) {
            console.log(`[SwapEngine] Cache Hit for ${cacheKey}`);
            return cachedResult;
        }

        console.log(`[SwapEngine] Cache Miss for ${cacheKey}. Calculating...`);

        const requester = await User.findById(requesterId);
        const event = await Event.findById(eventId);

        if (!requester || !event) return { score: 0, reason: "Entities not found" };

        // Organization Check: Zero Data Leakage
        if (!requester.organization || !event.organization) {
            return { score: 0, reason: "Security violation: Organization missing on entities." };
        }

        if (requester.organization.toString() !== event.organization.toString()) {
            return { score: 0, reason: "Security violation: Cross-organization analysis blocked" };
        }

        let score = 50; // Base score
        let reasons = [];

        // Chronotype Analysis
        const eventHour = new Date(event.startTime).getHours();
        const chrono = requester.profile?.chronotype || "bear";

        let isPeak = false;
        if (chrono === "lion" && eventHour >= 6 && eventHour <= 12) isPeak = true;
        else if (chrono === "bear" && eventHour >= 9 && eventHour <= 17) isPeak = true;
        else if (chrono === "wolf" && eventHour >= 16 && eventHour <= 23) isPeak = true;

        if (isPeak) {
            score += 20;
            reasons.push("Energy Peak Match");
        } else {
            score -= 10;
            reasons.push("Off-Peak Time");
        }

        // Reputation Boost
        const rep = requester.availability?.reputationScore || 100;
        if (rep > 150) {
            score += 15;
            reasons.push("High Reputation");
        }

        // Role Match (Placeholder)
        if (requester.roles?.includes("admin")) {
            score += 10;
            reasons.push("Admin Priority");
        }

        // Random noise to simulate real-world variance (smaller range for consistency)
        score += Math.floor(Math.random() * 6) - 3;

        // Cap score at 100
        score = Math.min(Math.max(score, 0), 100);

        const result = {
            score: Math.round(score),
            reason: reasons.join(", "),
            risk: score < 40 ? "High" : score < 70 ? "Medium" : "Low",
            suggestion: this.generateSuggestion(score, reasons),
            timestamp: new Date()
        };

        // Store in cache
        this.cache.set(cacheKey, result);

        return result;
    }

    generateSuggestion(score, reasons) {
        if (score > 80) return "Ideal match! High probability of acceptance.";
        if (score > 50) return `Good potential, mainly due to ${reasons[0] || 'availability'}.`;
        return "Low compatibility. Consider offering an incentive (points/favors).";
    }

    async findSwapChains(userId, targetEventId) {
        // Algorithm readiness: This logic would involve cycle detection in a directed graph.
        return [];
    }

    calculateAuctionStatus(bids) {
        if (!bids || bids.length === 0) return { current: 0, nextMin: 10 };
        const maxBid = Math.max(...bids.map(b => b.amount));
        return { current: maxBid, nextMin: maxBid + 5 };
    }
}

export default new SwapEngine();

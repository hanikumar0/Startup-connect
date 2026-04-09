import Event from "../models/Event.js";
import AnalyticsStartup from "../models/AnalyticsStartup.js";
import AnalyticsInvestor from "../models/AnalyticsInvestor.js";

/**
 * @desc    Universal platform tracking utility
 * @param   {Object} data - { userId, type, targetId, targetType, metadata }
 */
export const trackEvent = async ({ userId, type, targetId, targetType, metadata = {} }) => {
    try {
        // 1. Create a granular event entry
        await Event.create({ userId, type, targetId, targetType, metadata });

        // 2. Increment counters in summary tables based on event type
        if (targetType === 'startup') {
            const updateField = mapEventTypeToField(type, 'startup');
            if (updateField) {
                await AnalyticsStartup.findOneAndUpdate(
                    { startupId: targetId },
                    { $inc: { [updateField]: 1 } },
                    { upsert: true }
                );
            }
        } else if (targetType === 'investor') {
            const updateField = mapEventTypeToField(type, 'investor');
            if (updateField) {
                await AnalyticsInvestor.findOneAndUpdate(
                    { investorId: targetId },
                    { $inc: { [updateField]: 1 } },
                    { upsert: true }
                );
            }
        }

        return true;
    } catch (error) {
        console.error("Tracking error:", error);
        return false;
    }
};

const mapEventTypeToField = (type, role) => {
    const startupMap = {
        'profile_view': 'profileViews',
        'pitch_download': 'pitchDownloads',
        'message_sent': 'messagesReceived', // Note: received by target
        'meeting_booked': 'meetingsBooked',
        'save_profile': 'savedCount',
        'match_clicked': 'matchClicks'
    };

    const investorMap = {
        'profile_view': 'startupsViewed',
        'match_clicked': 'matchesCount',
        'message_sent': 'messagesSent',
        'meeting_booked': 'meetingsScheduled',
        'save_profile': 'savedStartups',
        'contact_unlock': 'contactUnlocks'
    };

    return role === 'startup' ? startupMap[type] : investorMap[type];
};

import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        items: [
            {
                targetId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },
                targetType: {
                    type: String,
                    enum: ["startup", "investor"],
                    required: true,
                }
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Watchlist", watchlistSchema);

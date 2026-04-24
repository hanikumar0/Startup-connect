import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdAt: { type: Date, default: Date.now }
});

const CRMLeadSchema = new mongoose.Schema({
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerRole: { type: String, enum: ['startup', 'investor'], required: true },
    
    // The entity being tracked (if investor is owner, target is a startup user; if startup is owner, target is an investor user)
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['startup', 'investor'], required: true },
    
    stage: { type: String, required: true }, // Logic handled by controllers based on role
    
    notes: [NoteSchema],
    tasks: [TaskSchema],
    
    scoreSnapshot: { type: Number }, // Funding readiness or fit score at time of lead creation
    
    lastActivityAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'archived', 'closed'], default: 'active' }
}, { timestamps: true });

// Ensure a user can only have one CRM entry for a specific target
CRMLeadSchema.index({ ownerUserId: 1, targetId: 1 }, { unique: true });

const CRMLead = mongoose.model("CRMLead", CRMLeadSchema);

export default CRMLead;

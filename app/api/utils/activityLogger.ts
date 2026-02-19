import Activity from '@/app/api/models/Activity';

export interface ActivityLog {
  type: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  details?: Record<string, unknown>;
  performedBy?: string;
}

export async function logActivity(activityData: ActivityLog) {
  try {
    await Activity.create({
      type: activityData.type,
      userId: activityData.userId,
      userName: activityData.userName,
      userEmail: activityData.userEmail,
      action: activityData.action,
      details: activityData.details,
      performedBy: activityData.performedBy,
    });
  } catch (error: any) {
    console.error('Failed to log activity:', error.message);
  }
}

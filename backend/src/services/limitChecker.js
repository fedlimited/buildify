const { getDb } = require('../config/database');

class LimitChecker {
  static async checkProjectLimit(companyId, subscription) {
    const db = getDb();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM projects WHERE company_id = ? AND status != "Archived"',
      [companyId]
    );
    const currentCount = result.count;
    const maxLimit = subscription.max_projects || 1;
    
    return {
      allowed: currentCount < maxLimit,
      current: currentCount,
      max: maxLimit,
      remaining: maxLimit - currentCount,
      canAdd: currentCount < maxLimit,
      isOverLimit: currentCount > maxLimit
    };
  }

  static async checkWorkerLimit(companyId, subscription) {
    const db = getDb();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM workers WHERE company_id = ? AND is_active = 1',
      [companyId]
    );
    const currentCount = result.count;
    const maxLimit = subscription.max_workers || 10;
    
    return {
      allowed: currentCount < maxLimit,
      current: currentCount,
      max: maxLimit,
      remaining: maxLimit - currentCount,
      canAdd: currentCount < maxLimit,
      isOverLimit: currentCount > maxLimit
    };
  }

  static async checkUserLimit(companyId, subscription) {
    const db = getDb();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM users WHERE company_id = ? AND role != "admin"',
      [companyId]
    );
    const currentCount = result.count;
    const maxLimit = subscription.max_users || 1;
    
    return {
      allowed: currentCount < maxLimit,
      current: currentCount,
      max: maxLimit,
      remaining: maxLimit - currentCount,
      canAdd: currentCount < maxLimit,
      isOverLimit: currentCount > maxLimit
    };
  }

  static async checkAllLimits(companyId, subscription) {
    const [projects, workers, users] = await Promise.all([
      this.checkProjectLimit(companyId, subscription),
      this.checkWorkerLimit(companyId, subscription),
      this.checkUserLimit(companyId, subscription)
    ]);
    
    return {
      projects,
      workers,
      users,
      isAnyOverLimit: projects.isOverLimit || workers.isOverLimit || users.isOverLimit,
      canAddAny: projects.canAdd || workers.canAdd || users.canAdd
    };
  }

  static canDowngradeToPlan(currentLimits, targetPlan) {
    const errors = [];
    
    if (currentLimits.projects.current > targetPlan.max_projects) {
      errors.push(`You have ${currentLimits.projects.current} projects but ${targetPlan.name} plan only allows ${targetPlan.max_projects}. Please delete down to ${targetPlan.max_projects} project(s) first.`);
    }
    
    if (currentLimits.workers.current > targetPlan.max_workers) {
      errors.push(`You have ${currentLimits.workers.current} workers but ${targetPlan.name} plan only allows ${targetPlan.max_workers}. Please delete down to ${targetPlan.max_workers} worker(s) first.`);
    }
    
    if (currentLimits.users.current > targetPlan.max_users) {
      errors.push(`You have ${currentLimits.users.current} users but ${targetPlan.name} plan only allows ${targetPlan.max_users}. Please delete down to ${targetPlan.max_users} user(s) first.`);
    }
    
    return {
      allowed: errors.length === 0,
      errors
    };
  }
}

module.exports = LimitChecker;
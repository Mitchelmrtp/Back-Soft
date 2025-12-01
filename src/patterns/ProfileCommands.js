// ⚡ Profile Commands - Command Pattern implementation
// Following Command Pattern to encapsulate profile operations

class Command {
  /**
   * Execute command
   */
  async execute() {
    throw new Error('Method execute must be implemented by subclass');
  }

  /**
   * Undo command (optional)
   */
  async undo() {
    throw new Error('Method undo not implemented');
  }

  /**
   * Can undo command
   */
  canUndo() {
    return false;
  }
}

// Update profile command
class UpdateProfileCommand extends Command {
  constructor(userService, userId, updateData, originalData = null) {
    super();
    this.userService = userService;
    this.userId = userId;
    this.updateData = updateData;
    this.originalData = originalData;
    this.executed = false;
  }

  async execute() {
    if (!this.originalData) {
      // Store original data for potential undo
      this.originalData = await this.userService.getUserProfile(this.userId);
    }

    const result = await this.userService.updateUserProfile(this.userId, this.updateData);
    this.executed = true;
    
    return result;
  }

  async undo() {
    if (!this.executed || !this.originalData) {
      throw new Error('Cannot undo: command not executed or no original data');
    }

    const undoData = this.extractUndoData();
    await this.userService.updateUserProfile(this.userId, undoData);
    this.executed = false;
  }

  canUndo() {
    return this.executed && this.originalData !== null;
  }

  extractUndoData() {
    const undoData = {};
    const allowedFields = ['name', 'phone', 'bio', 'department', 'position'];
    
    allowedFields.forEach(field => {
      if (this.updateData.hasOwnProperty(field)) {
        undoData[field] = this.originalData[field];
      }
    });
    
    return undoData;
  }
}

// Change password command
class ChangePasswordCommand extends Command {
  constructor(userService, userId, currentPassword, newPassword) {
    super();
    this.userService = userService;
    this.userId = userId;
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
    this.executed = false;
  }

  async execute() {
    await this.userService.changePassword(this.userId, this.currentPassword, this.newPassword);
    this.executed = true;
  }

  canUndo() {
    return false; // Password changes cannot be undone for security reasons
  }
}

// Delete avatar command
class DeleteAvatarCommand extends Command {
  constructor(userService, userId) {
    super();
    this.userService = userService;
    this.userId = userId;
    this.originalAvatar = null;
    this.executed = false;
  }

  async execute() {
    // Store original avatar for potential undo
    const user = await this.userService.getUserProfile(this.userId);
    this.originalAvatar = user.avatar;
    
    const result = await this.userService.deleteAvatar(this.userId);
    this.executed = true;
    
    return result;
  }

  async undo() {
    if (!this.executed || !this.originalAvatar) {
      throw new Error('Cannot undo: command not executed or no original avatar');
    }

    // Note: In a real implementation, you'd need to restore the actual file
    // This is a simplified example
    console.log(`Would restore avatar: ${this.originalAvatar}`);
    this.executed = false;
  }

  canUndo() {
    return this.executed && this.originalAvatar !== null;
  }
}

// Command invoker
class ProfileCommandInvoker {
  constructor() {
    this.history = [];
    this.currentPosition = -1;
  }

  /**
   * Execute command and add to history
   * @param {Command} command - Command to execute
   */
  async executeCommand(command) {
    try {
      const result = await command.execute();
      
      // Add to history (remove any commands after current position first)
      this.history = this.history.slice(0, this.currentPosition + 1);
      this.history.push(command);
      this.currentPosition = this.history.length - 1;
      
      return result;
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }

  /**
   * Undo last command
   */
  async undo() {
    if (!this.canUndo()) {
      throw new Error('No command to undo');
    }

    const command = this.history[this.currentPosition];
    
    if (!command.canUndo()) {
      throw new Error('Command cannot be undone');
    }

    try {
      await command.undo();
      this.currentPosition--;
      return true;
    } catch (error) {
      console.error('Error undoing command:', error);
      throw error;
    }
  }

  /**
   * Redo next command
   */
  async redo() {
    if (!this.canRedo()) {
      throw new Error('No command to redo');
    }

    const command = this.history[this.currentPosition + 1];
    
    try {
      await command.execute();
      this.currentPosition++;
      return true;
    } catch (error) {
      console.error('Error redoing command:', error);
      throw error;
    }
  }

  /**
   * Check if undo is possible
   */
  canUndo() {
    return this.currentPosition >= 0 && 
           this.history[this.currentPosition] && 
           this.history[this.currentPosition].canUndo();
  }

  /**
   * Check if redo is possible
   */
  canRedo() {
    return this.currentPosition < this.history.length - 1;
  }

  /**
   * Get command history
   */
  getHistory() {
    return this.history.map((command, index) => ({
      index,
      type: command.constructor.name,
      executed: command.executed,
      canUndo: command.canUndo(),
      isCurrent: index === this.currentPosition
    }));
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
    this.currentPosition = -1;
  }
}

export {
  UpdateProfileCommand,
  ChangePasswordCommand,
  DeleteAvatarCommand,
  ProfileCommandInvoker
};

export default ProfileCommandInvoker;
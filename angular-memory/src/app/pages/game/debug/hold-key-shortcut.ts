interface HoldKeyShortcutConfig {
  key: string;
  holdDurationMs: number;
  shouldTrigger: () => boolean;
  onHoldComplete: () => void;
}

export class HoldKeyShortcut {
  private holdTimeoutId: number | null = null;
  private isKeyPressed = false;

  private readonly normalizedKey: string;

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key.toLowerCase() !== this.normalizedKey) {
      return;
    }

    if (!this.config.shouldTrigger() || this.isKeyPressed || this.isTypingContextActive()) {
      return;
    }

    this.isKeyPressed = true;
    this.holdTimeoutId = window.setTimeout(() => {
      this.config.onHoldComplete();
      this.reset();
    }, this.config.holdDurationMs);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key.toLowerCase() !== this.normalizedKey) {
      return;
    }

    this.reset();
  };

  constructor(private readonly config: HoldKeyShortcutConfig) {
    this.normalizedKey = config.key.toLowerCase();
  }

  start(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  stop(): void {
    this.reset();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private reset(): void {
    this.isKeyPressed = false;

    if (this.holdTimeoutId !== null) {
      window.clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = null;
    }
  }

  private isTypingContextActive(): boolean {
    const activeElement = document.activeElement;

    return (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement instanceof HTMLSelectElement ||
      activeElement?.hasAttribute('contenteditable') === true
    );
  }
}

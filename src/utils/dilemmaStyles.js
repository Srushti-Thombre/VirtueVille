/**
 * Unified Design System for All Dilemma Modals
 * This ensures consistent styling across all scenes
 */

export const DilemmaStyles = {
  // Modal Background
  modal: {
    backgroundColor: 0x222244,    // Dark blue-purple
    backgroundAlpha: 0.95,
    borderColor: 0xffffff,       // White border
    borderWidth: 4,
    borderRadius: 20,
    width: 600,
    height: 400,
  },

  // Title/Header
  title: {
    fontSize: "28px",
    fontFamily: "Poppins, Arial, sans-serif",
    fontStyle: "bold",
    color: "#FFD700",            // Gold
    align: "center",
  },

  // Main question/message text
  question: {
    fontSize: "18px",
    fontFamily: "Poppins, Arial, sans-serif",
    color: "#FFFFFF",            // White
    wordWrap: { width: 560 },
    align: "left",
    lineSpacing: 4,
  },

  // Option buttons
  option: {
    fontSize: "16px",
    fontFamily: "Poppins, Arial, sans-serif",
    color: "#00E6E6",            // Cyan
    backgroundColor: "#333355",  // Dark purple-blue
    padding: { left: 12, right: 12, top: 8, bottom: 8 },
  },

  // Option hover state
  optionHover: {
    color: "#FFFFFF",            // White
    backgroundColor: "#5555AA",  // Lighter purple-blue
  },

  // Option normal state (for resetting hover)
  optionNormal: {
    color: "#00E6E6",            // Cyan
    backgroundColor: "#333355",  // Dark purple-blue
  },
};

/**
 * Helper function to create a standardized dilemma modal
 * @param {Phaser.Scene} scene - The scene to create the modal in
 * @param {Object} config - Configuration object
 * @param {string} config.title - Modal title
 * @param {string} config.message - Main question/message
 * @param {Array} config.options - Array of option objects {text, id, traits, reason}
 * @param {Function} config.onSelect - Callback when option is selected
 * @param {number} config.depth - Base depth for modal elements (default: 5000)
 */
export function createDilemmaModal(scene, config) {
  const {
    title = "Moral Dilemma",
    message,
    options,
    onSelect,
    depth = 5000,
  } = config;

  const width = scene.cameras.main.width;
  const height = scene.cameras.main.height;
  const boxWidth = DilemmaStyles.modal.width;
  const boxHeight = DilemmaStyles.modal.height;
  const boxX = width / 2 - boxWidth / 2;
  const boxY = height / 2 - boxHeight / 2;

  // Create modal background
  const popupBg = scene.add.graphics();
  popupBg.setDepth(depth + 1);
  popupBg.fillStyle(
    DilemmaStyles.modal.backgroundColor,
    DilemmaStyles.modal.backgroundAlpha
  );
  popupBg.fillRoundedRect(
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    DilemmaStyles.modal.borderRadius
  );
  popupBg.lineStyle(
    DilemmaStyles.modal.borderWidth,
    DilemmaStyles.modal.borderColor,
    1
  );
  popupBg.strokeRoundedRect(
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    DilemmaStyles.modal.borderRadius
  );

  // Create title
  const titleText = scene.add
    .text(width / 2, boxY + 35, title, DilemmaStyles.title)
    .setOrigin(0.5)
    .setDepth(depth + 2);

  // Create message
  const messageText = scene.add
    .text(boxX + 20, boxY + 80, message, DilemmaStyles.question)
    .setDepth(depth + 2);

  // Create options
  const optionElements = [];
  let y = boxY + 180;
  const optionGap = 50;

  options.forEach((opt, i) => {
    const optionText = scene.add
      .text(boxX + 40, y, `${i + 1}. ${opt.text}`, DilemmaStyles.option)
      .setDepth(depth + 3)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        optionText.setStyle(DilemmaStyles.optionHover);
      })
      .on("pointerout", () => {
        optionText.setStyle(DilemmaStyles.optionNormal);
      })
      .on("pointerdown", () => {
        if (onSelect) onSelect(opt, i);
      });

    optionElements.push(optionText);
    y += optionGap;
  });

  // Return all created elements for cleanup
  return {
    background: popupBg,
    title: titleText,
    message: messageText,
    options: optionElements,
    destroy: () => {
      popupBg.destroy();
      titleText.destroy();
      messageText.destroy();
      optionElements.forEach((opt) => opt.destroy());
    },
  };
}

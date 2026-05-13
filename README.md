# 🏙️ VirtueVille

A web-based moral decision-making game that helps players develop ethical reasoning and character traits through interactive scenarios.

🎮 **[Play VirtueVille Live (Ctrl + Click to open in a new tab)](https://virtueville.onrender.com)**

## 🎮 About the Game

VirtueVille is an educational game where players navigate through a virtual city and face various moral dilemmas. Players make choices that affect their character traits like empathy, responsibility, courage, and more. The game uses the Phaser.js framework to create an engaging 2D top-down experience.

## ✨ Features

- **Interactive City Exploration**: Navigate through a detailed city map with various locations
- **Moral Decision System**: Face ethical dilemmas that shape your character
- **Character Trait Tracking**: Monitor 6 core traits (empathy, responsibility, courage, fear, selfishness, dishonesty)
- **Multiple Scenarios**: Explore different locations like libraries, bus stops, and more
- **User Authentication**: Secure login and registration system
- **Progress Persistence**: Save and load your character development progress
- **Responsive Design**: Beautiful character carousel and modern UI

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Game Engine**: [Phaser.js 3.70.0](https://phaser.io/)
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Session Management**: Express Session
- **Build Tool**: Vite
- **Assets**: Kenney Toon Characters sprite sheets

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Srushti-Thombre/VirtueVille.git
   cd VirtueVille
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Run the backend server**

   ```bash
   node server.js
   ```

5. **Access the game**
   - Open your browser and navigate to `http://localhost:3000`
   - Create an account or login to start playing

## 🎯 How to Play

1. **Register/Login**: Create an account or sign in to save your progress
2. **Explore the City**: Use arrow keys to move your character around the map
3. **Interact with Locations**: Visit different areas to trigger scenarios
4. **Make Decisions**: Choose your responses to moral dilemmas
5. **Track Progress**: Monitor how your choices affect your character traits
6. **Continue Growing**: Revisit locations for new scenarios and character development

## 🏗️ Project Structure

```
VirtueVille/
├── public/                 # Static assets
│   ├── home_assets/       # Character images for homepage
│   ├── kenney_toon-characters-1/  # Sprite sheets
│   ├── maps/              # Tiled map files
│   ├── tilesets/          # Tileset images
│   ├── data/              # CSS and JS for auth
│   ├── home.css           # Homepage styles
│   └── phaser.html        # Main game page
├── src/                   # Game source code
│   ├── scenes/            # Phaser game scenes
│   │   ├── GameScene.js   # Main gameplay scene
│   │   ├── LibraryScene.js
│   │   ├── SituationScene.js
│   │   └── ...
│   ├── state/             # Game state management
│   │   └── traits.js      # Character trait system
│   └── main.js            # Game initialization
├── view/                  # HTML templates
│   ├── auth.html          # Authentication page
│   └── index.html         # Game container
├── server.js              # Express server
├── package.json           # Dependencies and scripts
└── users.db              # SQLite database
```

## 🎨 Game Scenes

- **GameScene**: Main city exploration with character movement
- **LibraryScene**: Library-specific interactions and scenarios
- **SituationScene**: Moral dilemma presentation and choice handling
- **PocketScene**: Additional scenario location
- **SituationScene1**: Alternative situation presentations

## 📊 Character Traits System

The game tracks six core character traits on a scale of 0-10:

- **Empathy**: Understanding and sharing others' feelings
- **Responsibility**: Taking ownership of actions and duties
- **Courage**: Facing challenges despite fear
- **Fear**: Anxiety or apprehension levels
- **Selfishness**: Prioritizing personal interests
- **Dishonesty**: Tendency toward deception

## 🔧 Development Scripts

```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

## 🙏 Acknowledgments

- **Kenney.nl** for the excellent toon character sprite sheets
- **Phaser.js** community for the robust game framework
- All contributors and testers who help improve the game

## 🐛 Issues & Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/Srushti-Thombre/VirtueVille/issues) on GitHub.

---

**Made with ❤️ for character development and moral education**

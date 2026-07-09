# MindMatch AI 🎮🧠
### *An Intelligent, Interactive Cognitive Memory Card Matching Game*

**MindMatch AI** is a fully functional, high-fidelity browser puzzle game where players flip custom-styled cards to find matching pairs. Beyond traditional memory games, MindMatch AI features an **adjustable Heuristic AI Opponent** that plays alongside you—observing your actions, recording card coordinates, and adapting its memory retention based on your chosen difficulty.

Built with **React 19**, **TypeScript**, and **Tailwind CSS**, the application utilizes a custom **Web Audio Synthesizer** (via the Web Audio API) to deliver retro-arcade audio feedbacks dynamically, without relying on external static audio files.

---

## 🚀 Key Features

*   **Adjustable AI Opponent**: Play solo or compete against a heuristic AI brain that utilizes simulated RAM allocation, forgetting rates, and sensory scan maps.
    *   *Easy AI*: Retains up to 4 cards, decays memory quickly (35% forget chance/turn).
    *   *Medium AI*: Retains up to 10 cards, moderate memory decay (15% forget chance).
    *   *Genius AI*: Persistent, flawless coordinate recollection.
*   **Aesthetic Visual Themes**:
    *   🌿 *Animals Theme*: Cute, nature-inspired palette with vibrant card styles.
    *   💻 *Developer Theme*: Futuristic terminal style with coding syntax labels.
    *   🌌 *Cosmic Space Theme*: Deep space aesthetic with high-contrast starlight tokens.
*   **Dynamic Audio Engine**: A programmatic synthesizer using oscillator nodes and frequency envelopes. Includes custom sounds for card flips, matches, errors, win arpeggios, and achievement celebrations.
*   **Progressive Achievement System**: Unlock special badges and track game profiles, win rates, and streak patterns, all persistent via **HTML5 LocalStorage**.
*   **Sleek 3D Flip Animations**: Fluid card-turn experiences designed with responsive CSS Grid layouts, perspective matrices, and CSS transforms.

---

## 🛠️ Technology Stack

*   **Frontend**: React (v19) with Vite
*   **Programming Language**: TypeScript
*   **Styling**: Tailwind CSS (v4) with CSS 3D Transforms
*   **Audio**: Web Audio API (Programmatic Sound Oscillators)
*   **Icons**: Lucide React
*   **Animations**: Motion (`motion/react`)
*   **Data Persistence**: HTML5 LocalStorage

---

## 💻 Local Setup & Development

To run this project locally on your machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Installation

1. **Download and Extract**:
   Export the workspace project as a ZIP archive and extract it to your preferred folder.

2. **Install Dependencies**:
   Open your command line/terminal in the root directory and run:
   ```bash
   npm install
   ```

3. **Launch Local Server**:
   Start the local development server:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to the local address displayed in your terminal (usually `http://localhost:3000` or `http://localhost:5173`).

---

## 🏆 Portfolio Achievements Demonstrated
By creating this project, the following core software engineering concepts are displayed:
1.  **State Management**: Complex turn transitions, lock triggers during flips, and cross-component score syncing.
2.  **Algorithmic Heuristics**: Implementing a simulated memory decay and weighted decision tree for the AI opponent.
3.  **Low-Latency Web Audio**: Building a software-synthesizer utilizing Node-based frequency nodes rather than downloading media files.
4.  **Responsive UI/UX**: Crafting accessible high-contrast themes responsive from mobile grids up to wide-aspect desktop monitors.

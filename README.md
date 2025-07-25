# React Bits MCP Server

🚀 **MCP Server for React Bits** - Access 99+ premium React components with animations, backgrounds, and UI elements through the Model Context Protocol.

## 🌟 Features

- **99+ Components**: Access to a comprehensive library of React components
- **4 Categories**: Animations, Backgrounds, Components, and Text Animations
- **MCP Protocol**: Seamless integration with MCP-compatible clients
- **TypeScript Support**: Full TypeScript definitions included
- **File-based**: No external dependencies or API keys required
- **Real-time**: Components are read directly from the file system

## 📦 Installation

### Via npm (Recommended)
```bash
npm install -g react-bits-mcp-server
```

### Via GitHub
```bash
git clone https://github.com/duolabstech/react-bits-mcp-server.git
cd react-bits-mcp-server
npm install
```

## 🚀 Usage

### As a Global Package
```bash
react-bits-mcp
```

### With MCP Client
Add to your MCP client configuration:
```json
{
  "mcpServers": {
    "react-bits": {
      "command": "react-bits-mcp",
      "args": []
    }
  }
}
```
### If you're a Vibe Coder
Add to your assistent Cursor, Trae, Windsurf, VSCode:
```json
{
  "mcpServers": {
    "react-bits": {
      "command": "npx",
      "args": [
        "reactbits-mcp-server"
      ],
      "env": {
        "your-Github-Access-Token"
      }
    }
  }
}```

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `list_components` | List all available components |
| `get_component` | Get source code for a specific component |
| `get_component_demo` | Get demo code for a component |
| `get_component_metadata` | Get component metadata and dependencies |
| `search_components` | Search components by name or category |

## 📊 Component Categories

### 🎬 Animations (20 components)
- AnimatedContent, BlobCursor, ClickSpark, Crosshair, Cubes
- FadeContent, GlareHover, ImageTrail, Magnet, MagnetLines
- MetaBalls, MetallicPaint, Noise, PixelTrail, PixelTransition
- Ribbons, ShapeBlur, SplashCursor, StarBorder, StickerPeel, TargetCursor

### 🌈 Backgrounds (24 components)
- Aurora, Balatro, Ballpit, Beams, DarkVeil, Dither
- DotGrid, FaultyTerminal, Galaxy, GridDistortion, GridMotion
- Hyperspeed, Iridescence, LetterGlitch, LightRays, Lightning
- LiquidChrome, Orb, Particles, RippleGrid, Silk, Squares, Threads, Waves

### 🧩 Components (32 components)
- AnimatedList, BounceCards, CardSwap, Carousel, ChromaGrid
- CircularGallery, Counter, DecayCard, Dock, ElasticSlider
- FlowingMenu, FluidGlass, FlyingPosters, Folder, GlassIcons
- GlassSurface, GooeyNav, InfiniteMenu, InfiniteScroll, Lanyard
- MagicBento, Masonry, ModelViewer, PixelCard, ProfileCard
- RollingGallery, ScrollStack, SpotlightCard, Stack, Stepper, TiltedCard

### ✨ Text Animations (23 components)
- ASCIIText, BlurText, CircularText, CountUp, CurvedLoop
- DecryptedText, FallingText, FuzzyText, GlitchText, GradientText
- RotatingText, ScrambledText, ScrollFloat, ScrollReveal, ScrollVelocity
- ShinyText, SplitText, TextCursor, TextPressure, TextTrail
- TextType, TrueFocus, VariableProximity

## 💡 Example Usage

### List All Components
```javascript
// MCP call
{
  "method": "tools/call",
  "params": {
    "name": "list_components",
    "arguments": {}
  }
}
```

### Get a Specific Component
```javascript
// Get AnimatedList component
{
  "method": "tools/call",
  "params": {
    "name": "get_component",
    "arguments": {
      "componentName": "AnimatedList"
    }
  }
}
```

### Search Components
```javascript
// Search for card components
{
  "method": "tools/call",
  "params": {
    "name": "search_components",
    "arguments": {
      "query": "card",
      "category": "Components"
    }
  }
}
```

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
git clone https://github.com/duolabstech/react-bits-mcp-server.git
cd react-bits-mcp-server
npm install
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you encounter any issues, please report them on [GitHub Issues](https://github.com/duolabstech/react-bits-mcp-server/issues).

## 🔗 Links

- [React Bits Website](https://reactbits.dev)
- [MCP Protocol](https://modelcontextprotocol.io)
- [npm Package](https://www.npmjs.com/package/react-bits-mcp-server)

---

**Made with ❤️ by the React Bits Team**

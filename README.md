# kingdom-builder-game
# Medieval Kingdom Builder

A web-based medieval kingdom building game built with Phaser 3. Players manage resources, construct buildings, and grow their kingdom through strategic planning and resource management.

## Current Implementation

### Game Features
- **3×3 Grid System**: Progressive plot unlocking with exponential costs
- **Resource Management**: Gold, Food, Wood, Population tracking
- **Building Types**: 
  - Wheat Field: Produces 10 gold every 60 seconds (Cost: 10 gold)
  - Peasant Hut: Produces 1 population every 120 seconds (Cost: 15 gold)
- **Production System**: Timed production with visual progress bars and harvest-ready indicators
- **Save System**: Auto-save every 30 seconds with offline progress calculation
- **Mobile Support**: Touch-responsive design

### Technical Stack
- **Framework**: Phaser 3.70.0 (CDN)
- **Architecture**: Single HTML file with embedded CSS/JS
- **Assets**: All textures generated programmatically (no external files)
- **Storage**: localStorage with version tracking
- **Performance**: 1-second update loop, 60fps target

## Design Philosophy

### Performance Standards
- **60 FPS target** on desktop, 30fps minimum on mobile
- **3-second max load time** for initial game start
- **Memory usage under 100MB** to prevent mobile crashes
- Efficient timer management and minimal DOM manipulation

### Accessibility
- **Consistent UI patterns** - same actions work identically everywhere
- **Clear visual hierarchy** - obvious interactive elements
- **Predictable timing** - no random delays or surprise animations
- **High contrast ratios** - following WCAG 2.1 AA standards
- **Keyboard navigation support** planned for future implementation

### Progression Philosophy
- **Always-positive progression** - no fail states or resource bankruptcy
- **Hook within 2 minutes** - meaningful progress quickly visible
- **Mathematical optimization gives advantages** but isn't required for enjoyment
- **Exponential costs with linear benefit increases** - sustainable long-term growth

## Resource Economy Design

### Current Resources
- **Gold**: Primary currency, moderately scarce early game
- **Food**: Currently unused - planned for population maintenance
- **Wood**: Currently unused - planned for Tier 2+ construction
- **Population**: Workforce + planned upgrade currency

### Resource Philosophy
- **Population as Upgrade Currency**: Spend citizens for automation, speed boosts, output multipliers, building evolution
- **Food Consumption Mechanic**: Maintains population, prevents runaway growth
- **Circular Economy**: Resources convert between each other
- **Multiple Currency Types**: Prevents single resource bottlenecks

### Building Tier System
- **Tier 1**: Gold only (current: Wheat Field, Peasant Hut)
- **Tier 2**: Gold + Wood (planned)
- **Tier 3**: Gold + Wood + Stone (planned)
- **Tier 4+**: Multiple rare materials (planned)

## Long-term Vision

### Three-Phase Progression
1. **Foundation (0-20 min)**
   - Basic resource generation
   - Plot expansion
   - Simple building variety

2. **Specialization (20-60 min)**
   - Population-bought upgrades unlock
   - Building evolution chains (peasant hut→house→mansion→estate→castle)
   - Automation options available
   - Multiple viable strategies emerge

3. **Mastery (60+ min)**
   - Advanced material management
   - Complex building interactions
   - Prestige/restart mechanics with bonuses
   - Optional mathematical optimization paths

### Planned Features

#### Population Upgrade Categories
- **Automation**: Auto-harvest buildings
- **Production Multipliers**: Increase output rates
- **Speed Boosts**: Faster production cycles
- **Building Evolution**: Upgrade building types permanently

#### Advanced Systems
- **Building Evolution Chains**: Linear progression paths for each building type
- **Advanced Materials**: Stone, Iron, etc. for higher-tier construction
- **Food Consumption**: Population maintenance mechanic
- **Automation Balance**: Population-cost auto-harvest unlocks

## Development Standards

### Code Organization
- **Modular gameState management** - avoid global variables
- **camelCase** for variables, **PascalCase** for classes
- **Consistent commenting** - explain complex game logic
- **Performance-first** - efficient update loops and memory usage

### Game Balance Principles
- **Scarcity drives early decisions** - limited starting resources
- **Abundance enables experimentation** - mid-game resource growth
- **Optimization rewards** - but never required for progress
- **Meaningful choices** - every upgrade/building decision matters

## Current Status

### Working Features
✅ Core building and harvesting mechanics  
✅ Resource management and UI  
✅ Plot purchasing system  
✅ Save/load with offline progress  
✅ Mobile-responsive design  

### Next Development Priorities
1. **Food consumption mechanic** - population maintenance system
2. **Population upgrade system** - spend citizens for improvements
3. **Building evolution chains** - upgrade paths for existing buildings
4. **Wood resource integration** - Tier 2 building requirements

### Known Limitations
- Food and Wood resources currently unused
- Only 2 building types available
- No automation options
- Limited late-game content

## Contributing

When adding features, maintain:
- Existing code style and architecture
- Performance standards (60fps target)
- Always-positive progression philosophy
- Accessibility considerations
- Mobile compatibility

Game should feel cohesive with current implementation while expanding depth and replayability.

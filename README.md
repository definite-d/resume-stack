# ResumeStack

A TypeScript library providing an alternative to Paystack's InlineJS for modal transaction resumption. It displays a modal with Paystack's checkout iframe using an access code, with support for dark mode and blur effects.

**Note**: Not affiliated with Paystack. Use at your own risk.
License: The Unlicense

## Features

- **Transaction Resumption**: Resume Paystack transactions using an access code
- **Modal Interface**: Full-screen modal with iframe to Paystack checkout
- **Theme Support**: Light, dark, or auto-detect based on system preference
- **Blur Effects**: Configurable backdrop blur for the modal overlay
- **Responsive Design**: Adapts to mobile and desktop devices
- **TypeScript Support**: Fully typed with TypeScript definitions
- **Lightweight**: No external dependencies beyond TypeScript

## Installation

```bash
npm install resume-stack
```

## Usage

### Basic Usage

```javascript
import { ResumeStack } from "resume-stack";

const resumestack = new ResumeStack({
  accessCode: "your_paystack_access_code",
});
```

The modal will open immediately upon instantiation.

### Advanced Usage

```javascript
import { ResumeStack } from "resume-stack";

const resumestack = new ResumeStack({
  accessCode: "your_paystack_access_code",
  theme: "auto", // 'light' | 'dark' | 'auto' (default)
  blur: "0.5rem", // backdrop blur, default '0.2rem'
  onSuccess: (data) => {
    console.log("Transaction successful", data);
  },
  onError: (data) => {
    console.log("Transaction error", data);
  },
  onCancel: () => {
    console.log("Transaction cancelled");
  },
});
```

### Using via CDN

```html
<!DOCTYPE html>
<html>
  <head>
    <title>ResumeStack Example</title>
  </head>
  <body>
    <div id="app">
      <button onclick="openResumeStack()">Resume Transaction</button>
    </div>

    <script src="https://unpkg.com/resume-stack/dist/index.js"></script>
    <script>
      function openResumeStack() {
        const resumestack = new window.ResumeStack({
          accessCode: "your_paystack_access_code",
          onSuccess: (data) => {
            alert("Transaction completed: " + JSON.stringify(data));
          },
          onError: (data) => {
            alert("Transaction error: " + JSON.stringify(data));
          },
          onCancel: () => {
            alert("Transaction cancelled");
          },
        });
      }
    </script>
  </body>
</html>
```

## API Reference

### ResumeStack

#### Constructor

```typescript
new ResumeStack(config: ResumeStackConfig)
```

Creates and immediately displays a modal with the Paystack checkout iframe.

### Types

#### ResumeStackConfig

```typescript
interface ResumeStackConfig {
  accessCode: string;
  onSuccess?: (data?: any) => void;
  onError?: (data?: any) => void;
  onCancel?: () => void;
  theme?: "light" | "dark" | "auto";
  blur?: string;
}
```

## Styling

ResumeStack injects CSS dynamically. You can override the styles using CSS:

```css
.resume-stack-modal {
  /* Custom modal overlay styles */
}

.resume-stack-content {
  /* Custom content styles */
}

.resume-stack-iframe {
  /* Custom iframe styles */
}

.resume-stack-close {
  /* Custom close button styles */
}
```

## Dark Mode

ResumeStack supports light, dark, and auto themes based on system preference.

```javascript
// Force dark mode
const resumestack = new ResumeStack({
  accessCode: "your_paystack_access_code",
  theme: "dark",
});

// Force light mode
const resumestack = new ResumeStack({
  accessCode: "your_paystack_access_code",
  theme: "light",
});

// Auto-detect (default)
const resumestack = new ResumeStack({
  accessCode: "your_paystack_access_code",
  theme: "auto",
});
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch for changes during development
npm run dev

# Clean build directory
npm run clean
```

## License

The Unlicense - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

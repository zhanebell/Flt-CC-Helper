# Flight Commander Helper

A Progressive Web App (PWA) designed to help flight commanders quickly manage and generate accountability statements for their cadets.

## Features

- **Quick Cadet Entry**: Enter comma-separated list of cadet names
- **Real-time Status Tracking**: Mark cadets as Present, Late, or Absent
- **Automatic Statement Generation**: Generates proper military accountability format
- **Mobile Optimized**: Designed for iPhone use with "Add to Home Screen" capability
- **Offline Capable**: Works without internet connection once installed

## Usage

1. Enter cadet names separated by commas
2. Click "Start Accountability"
3. Use dropdowns to set each cadet's status
4. The accountability statement updates automatically

## Generated Statement Format

```
Cadet [flt/cc] may I make a statement? Flight's accountability is as follows: 
# of # cadets present. # accounted for # unaccounted for. 
Cadets [name], [name], and [name] will be attending late. 
Cadets [name], [name], [name], will not be attending.
```

## Installation on iPhone

1. Open Safari and navigate to the app
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear as an icon on your home screen

## Technologies Used

- HTML5
- CSS3 (with mobile-first responsive design)
- Vanilla JavaScript
- Progressive Web App (PWA) features
- Service Worker for offline functionality

## Development

To run locally:
1. Clone the repository
2. Open `index.html` in a web browser
3. For full PWA features, serve over HTTPS

## License

MIT License
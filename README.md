# KnowsU
A NodeJS app that uses IBM Watson to analyze users' emotions through text with other APIs like Spotify to give user suggestions of books, movies, and music.

Check out the [Devpost link:](https://devpost.com/software/knowsu)

Don't forget to include your configuration from IBM Watson:
```javascript
// configuration for tone_analyzer
var tone_analyzer = new ToneAnalyzerV3({
  username: 'your-username',
  password: 'your-password',
  version_date: 'API version date'
});
```

### API used: 
1. Watson Tone Analyzer
2. Google Books API
3. OMDB Movie API
4. Spotify Music API

### NPM Packages:
1. Express
2. Body-parser
3. Request

### View Engine:
1. Ejs

### Front-end Framework
1. Semantics-UI
2. Hover.css
3. Animate.css

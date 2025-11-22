# Instructions pour ajouter le logo ACM ESPRIT

## Option 1: Fichier local (Recommandé)
1. Placez votre fichier logo dans le même dossier que `index.html`
2. Nommez-le `logo.png` (ou modifiez le nom dans le code si nécessaire)
3. Le logo s'affichera automatiquement

## Option 2: URL en ligne
1. Uploadez votre logo sur un service d'hébergement d'images (Imgur, Cloudinary, etc.)
2. Remplacez `src="logo.png"` par l'URL de votre logo dans `index.html` (ligne ~430)

## Option 3: Base64
1. Convertissez votre image en Base64
2. Remplacez `src="logo.png"` par `src="data:image/png;base64,VOTRE_CODE_BASE64"`

Le logo sera automatiquement masqué s'il ne peut pas être chargé.


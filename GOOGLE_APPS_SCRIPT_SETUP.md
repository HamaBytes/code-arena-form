# Configuration Google Apps Script

## Instructions d'installation

### Étape 1: Créer le Google Sheet
1. Allez sur [Google Sheets](https://sheets.google.com)
2. Créez un nouveau tableur
3. Renommez la première feuille en "Réponses" (optionnel, le script utilisera la première feuille par défaut)

### Étape 2: Ajouter le script
1. Dans votre Google Sheet, allez dans **Extensions → Apps Script**
2. Supprimez tout le code par défaut
3. Copiez-collez le contenu du fichier `google-apps-script.js`
4. Cliquez sur **Enregistrer** (💾)

### Étape 3: Déployer comme Web App
1. Cliquez sur **Déployer → Nouveau déploiement**
2. Cliquez sur l'icône ⚙️ à côté de "Type" et sélectionnez **Application Web**
3. Configurez:
   - **Description**: Code Arena 2025 Form Handler
   - **Exécuter en tant que**: Moi
   - **Qui a accès**: N'importe qui
4. Cliquez sur **Déployer**
5. **Copiez l'URL du Web App** (elle ressemble à: `https://script.google.com/macros/s/.../exec`)

### Étape 4: Mettre à jour le formulaire
1. Ouvrez `index.html`
2. Trouvez la ligne avec `GOOGLE_SCRIPT_URL`
3. Remplacez l'URL par celle que vous venez de copier

### Étape 5: Tester
1. Dans Apps Script, allez dans **Exécuter → testDoPost**
2. Autorisez les permissions si demandé
3. Vérifiez que les données apparaissent dans votre Google Sheet

## Fonctionnalités

- ✅ Enregistrement automatique des soumissions
- ✅ Formatage automatique des en-têtes
- ✅ Gestion des erreurs robuste
- ✅ Menu personnalisé dans Google Sheets
- ✅ Export CSV
- ✅ Notifications email (optionnel)

## Menu personnalisé

Une fois le script installé, un menu "🏆 Code Arena 2025" apparaîtra dans votre Google Sheet avec:
- 🧪 Tester la soumission
- 📧 Configurer notifications
- 📥 Exporter CSV
- ℹ️ À propos

## Champs supportés

Le script est optimisé pour les champs suivants (correspondant au formulaire optimisé):
- Informations personnelles (nom, prénom, email, téléphone, statut)
- Détails académiques (niveau, spécialité, établissement)
- Expérience (compétitions, langages, profils)
- Motivation et engagement
- Disponibilité
- Compétences et références
- Déclarations

## Dépannage

### Le script ne fonctionne pas
1. Vérifiez que vous avez autorisé toutes les permissions
2. Vérifiez que l'URL du Web App est correcte dans `index.html`
3. Consultez les logs dans Apps Script (Exécuter → Afficher les logs)

### Les données ne s'enregistrent pas
1. Vérifiez que le nom de la feuille est "Réponses" ou laissez la première feuille
2. Vérifiez que vous avez les permissions d'écriture sur le Sheet
3. Testez avec la fonction `testDoPost`

### Erreur de headers
Le script initialise automatiquement les headers s'ils sont manquants. Si vous rencontrez des problèmes, supprimez toutes les données et laissez le script recréer les headers.


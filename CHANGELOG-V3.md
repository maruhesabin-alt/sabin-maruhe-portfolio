# V3 — CHANGEMENTS PRINCIPAUX

- Correction de l'architecture Supabase Storage pour les images publiques.
- Upload avec URLs publiques persistantes.
- Validation JPG / PNG / WebP et limite 8 MB.
- Vérification de dimensions d'image.
- Minimum de 4 images par projet.
- Protection côté interface + règle côté base de données.
- Vérification que le compte connecté appartient à la table admins.
- Ajout de la gestion des abonnés.
- Ajout du formulaire d'abonnement.
- Amélioration des messages de contact.
- Meilleure gestion des erreurs.
- Correction de l'ordre des images lors des uploads multiples.
- Cache-Control long pour les images publiques.
- Interface responsive et animations premium conservées.
- Ajout de _headers pour renforcer la sécurité du déploiement Cloudflare.
- Ajout de _redirects pour /admin.

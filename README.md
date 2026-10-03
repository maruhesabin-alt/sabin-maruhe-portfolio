# SABIN MARUHE — PORTFOLIO PRO V3

Version professionnelle du portfolio, préparée pour un déploiement statique avec **Cloudflare + Supabase**.

## Architecture

```text
index.html              → site public
admin.html              → administration privée
app.js                  → site public + chargement des données
admin.js                → administration + uploads
style.css               → interface responsive premium
supabase-config.js      → URL + clé publique Supabase
supabase-schema.sql     → tables + RLS + Storage + règles de sécurité
assets/                 → ressources locales éventuelles
```

## 1. Supabase

1. Crée un projet Supabase.
2. Ouvre **SQL Editor**.
3. Exécute entièrement `supabase-schema.sql`.
4. Dans **Authentication > Users**, crée ton compte administrateur.
5. Copie le UUID de ce compte.
6. Dans SQL Editor, exécute :

```sql
insert into public.admins (user_id)
values ('UUID-DE-TON-COMPTE');
```

7. Ouvre `supabase-config.js` et remplace uniquement :

```js
window.SUPABASE_CONFIG = {
  url: "https://TON-PROJET.supabase.co",
  anonKey: "TA_CLE_ANON_OU_PUBLISHABLE"
};
```

**Ne mets jamais la clé `service_role` dans le site.**

## 2. Stockage des images

Le bucket utilisé est :

`portfolio-media`

Il est public en lecture afin que les visiteurs du monde entier puissent voir les images.

Les visiteurs peuvent lire les images.
Seuls les utilisateurs présents dans `public.admins` peuvent téléverser, modifier ou supprimer les fichiers.

### Normes recommandées

Pour les images des projets :

- JPG, PNG ou WebP
- maximum : **8 MB**
- minimum accepté par l'interface : **1200 × 750 px**
- recommandé : **1600 × 1000 px ou supérieur**
- ratio conseillé : environ **16:10**
- image propre, sans texte ajouté directement sur l'image
- minimum : **4 images par projet**
- nombre maximum : non limité par l'interface

Les images sont enregistrées dans :

```text
portfolio-media/
└── projects/
    └── ID_DU_PROJET/
        ├── image-1.jpg
        ├── image-2.jpg
        └── ...
```

Le site enregistre également l'URL publique de chaque image dans `project_images`.

## 3. Pourquoi les images sont maintenant visibles sur les autres appareils

L'image ne dépend plus du dossier `assets` de ton ordinateur.

Le flux est :

```text
Ordinateur
   ↓
Administration
   ↓
Supabase Storage
   ↓
URL publique de l'image
   ↓
Base de données project_images
   ↓
Site public
   ↓
Téléphone / autre ordinateur / autre pays
```

C'est ce qui permet à une personne qui ouvre le site depuis un autre appareil de recevoir la même image.

## 4. Publication d'un projet

Dans l'administration :

1. Créer le projet.
2. Donner un nom.
3. Ajouter une petite description.
4. Choisir une catégorie.
5. Ajouter les collaborateurs/organisations si nécessaire.
6. Importer au moins 4 images.
7. Vérifier les images.
8. Activer « Publikigi projekton ».
9. Cliquer sur **Konservi ŝanĝojn**.

La base de données empêche également la publication d'un projet ayant moins de 4 images.

## 5. Messages et demandes

Le formulaire public peut recevoir :

- contact
- collaboration
- soutien d'un projet
- rejoindre l'équipe
- réunion Zoom / Google Meet
- formation multimédia
- accompagnement de projet

Les messages sont stockés dans `messages` et sont visibles uniquement dans l'administration.

## 6. Abonnement

Le formulaire d'abonnement utilise la table :

`subscribers`

Les adresses sont uniques pour éviter les doublons.

Les abonnés sont visibles dans l'administration.

> Pour une newsletter avec envoi automatique d'emails, il faudra ensuite connecter un service d'envoi (par exemple Resend, Brevo, MailerLite, etc.). Cette V3 enregistre déjà proprement les abonnés.

## 7. Sécurité

L'administration ne contient pas de mot de passe codé en JavaScript.

Le système utilise :

- Supabase Authentication
- table `admins`
- Row Level Security (RLS)
- Supabase Storage policies
- clé anon/publishable uniquement côté navigateur

Le compte doit être présent dans `admins` pour accéder aux données administratives.

## 8. Cloudflare

Si le dépôt GitHub contient directement :

```text
index.html
admin.html
app.js
admin.js
style.css
supabase-config.js
...
```

Cloudflare peut servir le projet comme site statique.

Aucune commande `npm` ou compilation n'est nécessaire pour cette version.

Si tu utilises un dossier `newproj`, indique ce dossier comme **Root directory** dans la configuration de build Cloudflare Pages.

## 9. Mise à jour du site

Workflow recommandé :

```text
VS Code
   ↓
modifier les fichiers
   ↓
enregistrer
   ↓
Git / GitHub
   ↓
Cloudflare détecte le nouveau commit
   ↓
nouveau déploiement
   ↓
site mis à jour
```

Les données, projets et images déjà enregistrés dans Supabase restent dans Supabase lors d'une nouvelle publication du code.

## 10. Important avant le premier déploiement V3

Teste d'abord :

1. connexion à `admin.html`
2. création d'un projet
3. ajout de 4 images
4. publication
5. ouverture de `index.html`
6. ouverture du site sur un téléphone
7. vérification que les 4 images apparaissent
8. envoi d'un message
9. abonnement avec une adresse email
10. retour dans l'administration pour vérifier les données

## Version

SABIN MARUHE PORTFOLIO PRO V3
Interface : Esperanto
Backend : Supabase
Storage : Supabase Storage
Hosting : Cloudflare

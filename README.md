# Elite Runners 🏃‍♂️🔥

> Une application web qui anime une communauté de coureurs à travers des défis collectifs : cumuler des kilomètres, maintenir des séries de jours d'activité, grimper dans les classements et se motiver en groupe.

**Projet personnel full-stack** conçu, développé et déployé de bout en bout — de l'idée jusqu'au code.

---

## 💡 Le contexte : pourquoi ce projet ?

Je fais partie d'un Runclub **Elite Runners**, où l'on se motive mutuellement à travers des défis réguliers. Le problème : ces défis étaient organisés à la main (messages de groupe, suivis dans un tableur), ce qui était fastidieux et peu engageant.

J'ai donc imaginé et construit une application web complète pour automatiser tout ça : un espace où un responsable crée des défis, où chaque membre enregistre ses activités, et où tout le monde suit sa progression en temps réel.

C'est un projet que j'ai mené **seul, du début à la fin** : conception, design, programmation du site visible par l'utilisateur (le « front-end ») et du système invisible qui gère les données (le « back-end »).

---

## Ce que fait l'application (en clair)

### Pour un membre de la communauté
- **Créer un compte** et se connecter de façon sécurisée.
- **Voir le défi en cours** et sa progression sur une page d'accueil claire.
- **Enregistrer ses activités** (par exemple « j'ai couru 8 km aujourd'hui »).
- **Suivre les classements** : qui a parcouru le plus de kilomètres, qui tient la plus longue série de jours d'affilée.
- **Consulter son profil** avec ses statistiques personnelles et l'historique de ce qu'il a accompli.
- **Débloquer des paliers** (badges) au fur et à mesure de ses progrès, pour rester motivé.

### Pour un responsable (administrateur)
- **Créer et organiser des défis** de différents types.
- **Gérer leur déroulement** : lancer, mettre en pause, ou clôturer un défi.
- **Gérer les membres** de la communauté (ajouter, retirer, promouvoir).

### Deux types de défis
1. **Défis de distance** — atteindre un objectif de kilomètres, seul ou en groupe.
2. **Défis de régularité (« streaks »)** — maintenir une série de jours consécutifs d'activité, l'idée étant d'ancrer une habitude.

Petite subtilité pensée pour être juste : quand un défi se termine, son classement final est **figé définitivement**. Même si les membres continuent de courir ensuite, le palmarès de ce défi reste gravé — comme un trophée.

---

## Aperçu

> *(Ajoute ici 2 ou 3 captures d'écran : la page d'accueil, un classement, la création d'un défi. Une image vaut mille mots pour un recruteur.)*

```
[ Capture — Tableau de bord ]
<img width="1899" height="944" alt="image" src="https://github.com/user-attachments/assets/956d2cea-2a00-4295-a56e-f85bb0768128" />


[ Capture — Classement ]
<img width="1893" height="946" alt="image" src="https://github.com/user-attachments/assets/e1b8c884-c060-4484-be92-b07646371a1a" />

[ Capture — Page de connexion ]
<img width="1892" height="944" alt="image" src="https://github.com/user-attachments/assets/6e195dba-d276-4a43-8d4b-853250ea5561" />
```

---

## Ce que ce projet démontre comme compétences

Ce projet m'a permis de mettre en pratique et de démontrer :

- **Le développement full-stack** : je maîtrise aussi bien la partie visible (interface utilisateur) que la partie serveur (logique et données).
- **La conception d'une base de données** et la gestion d'informations structurées (membres, défis, activités).
- **La sécurité** : authentification des utilisateurs, mots de passe chiffrés, gestion des droits (un membre ordinaire ne peut pas faire les mêmes actions qu'un administrateur).
- **La création d'interfaces soignées et responsives** : l'application s'adapte automatiquement à l'ordinateur comme au téléphone.
- **La traduction d'un besoin réel en produit fonctionnel** : partir d'un problème concret vécu dans ma communauté et livrer une solution complète.
- **L'autonomie et la persévérance** : mener un projet d'envergure seul, de la première ligne de code jusqu'au produit fini.

---

## Technologies utilisées

Pour les lecteurs techniques, voici les principaux outils employés :

| Partie | Technologies |
|--------|--------------|
| **Interface (front-end)** | React, Vite, React Router, Axios |
| **Serveur (back-end)** | Node.js, Express |
| **Base de données** | MongoDB (MongoDB Atlas) |
| **Sécurité** | Authentification par jetons (JWT), chiffrement des mots de passe (bcrypt) |
| **Design** | Bulma, police Poppins, icônes Material Symbols |

En termes simples : l'application repose sur des technologies modernes et largement utilisées dans l'industrie du développement web.

---

## Lancer le projet (pour un développeur)

> Cette section s'adresse à quelqu'un qui souhaite faire tourner le projet sur son ordinateur. Un recruteur peut passer directement à la section suivante.

<details>
<summary><b>Voir les instructions d'installation</b></summary>

### Prérequis
- Node.js v18 ou supérieur
- Un compte MongoDB Atlas (gratuit)

### Installation

Le projet contient deux parties : l'API (serveur) et l'application (interface).

```bash
# 1. Cloner le dépôt
git clone https://github.com/Huge43/ER-Challenges.git
cd ER-Challenges

# 2. Installer le serveur
cd elite-runners-api
npm install

# 3. Installer l'interface
cd ../ER-challenges.app
npm install
```

### Configuration

Créer un fichier `.env` dans le dossier du serveur :

```env
MONGO_URI=<lien de connexion MongoDB Atlas>
PORT=5000
JWT_SECRET=une_phrase_secrete
```

### Démarrage

Dans deux terminaux séparés :

```bash
# Terminal 1 — le serveur
cd elite-runners-api
npm run dev

# Terminal 2 — l'interface
cd ER-challenges.app
npm run dev
```

L'application s'ouvre sur **http://localhost:5173**

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | marie@elite.com | 1234 |
| Membre | alex@elite.com | 1234 |

</details>

---

## Suite du projet

Fonctionnalités prévues pour les prochaines versions :

- **Connexion via Google / Microsoft** pour simplifier l'inscription.
- **Mode équipes** : des équipes qui s'affrontent au sein d'un même défi.
- **Photos et médias** associés aux activités.
- **Notifications** pour garder la communauté engagée.
- **Mise en ligne** de l'application pour un accès public.

---

## À propos de l'auteur

**Glodie Ilunga Katanga**
Étudiant en développement d'applications au Collège de Maisonneuve (Montréal)

- GitHub : [github.com/Huge43](https://github.com/Huge43)


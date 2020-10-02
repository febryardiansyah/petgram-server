# Petgram-server
Petgram Server is A Backend that provides some features such as Instagram, this also uses
Machine Learning for detect user post (only Pet and Dog are allowed) and Push Notifications when someone
likes, comments, or follows other users.

<p align="center">
<img alt="GitHub issues" src="https://img.shields.io/github/issues/ebryardiansyah/petgram-server">
<img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/ebryardiansyah/petgram-server">
<img alt="GitHub" src="https://img.shields.io/github/license/ebryardiansyah/petgram-server"> 
<img alt="GitHub stars" src="https://img.shields.io/github/stars/ebryardiansyah/petgram-server">
<img alt="GitHub forks" src="https://img.shields.io/github/forks/ebryardiansyah/petgram-server">
<img alt="GitHub watchers" src="https://img.shields.io/github/watchers/ebryardiansyah/petgram-server">
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/ebryardiansyah/petgram-server">
<img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ebryardiansyah/petgram-server">
</p>

## Features

- Authentication
    - [x] Register
    - [x] Login
    - [x] JWT
    - [x] Email Verification
    - [x] Forgot Password
- User
    - [x] Follow
    - [x] Unfollow
    - [x] Edit Profile
    - [x] Search User
    - [x] User Profile
- Post
    - [x] Create Post (Only Cat and Dog are allowed)
    - [x] Delete Post
    - [x] Update Post
    - [x] Get Post Based On Following
    - [x] Get All Post
    - [x] Get User Post
    - [x] Caption
    - [x] Like
    - [x] Unlike
    - [x] Comment
    - [x] Delete Comment
    - [x] Upload Image
        
## Instalation

1. Clone this repo
```bash
git clone https://github.com/febryardiansyah/petgram-server.git
```

2. Install dependencies
```bash
npm install
```

3. Set up .env
Create file named `.env` in root directory and fill it with `.env.example`.

4. Run server

Production
    ```bash
    npm run start
    ```

Development
    ```bash
    npm run dev
    ```

## API Documentation
[here](https://documenter.getpostman.com/view/10283380/T1LV83UN?version=latest)
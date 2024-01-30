PUP MUNCHHUB API

Technologies: 
1. Express JS
2. MongoDB
3. AWS S3

Setup:

1. 
```bash
pnpm install
```
2. 
```bash
pnpm dev
```

Configure the .env.example and remove the .example at the end
```bash
MONGO_DB=mongodb+srv://root:<password>24@munchhub.szdevew.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
PORT=
```
API ROUTES
BASE ROUTE: http://localhost:4000
USER BASE ROUTE: http://localhost:4000/user

| Route      | Function               |
|------------|------------------------|
| /register  | Registers the user     |
| /login     | Logs the user and gives them access to all protected routes via tokens|
| /get_user  | Retrieves the information about the user [liked_posts, created_posts, bookmarked_posts]|
| /logout    | Logs the user out and expires the token |


POST BASE ROUTE: http://localhost:4000/post

| Route      | Function               |
|------------|------------------------|
| /get_posts | Gets all posts|
| /create_post | Creates a post (protected route)|
| /delete_post/:post_id | Deletes a post (protected route)|
| /update_post/:post_id | Updates a post (protected route)|
| /like_post/:post_id   | Likes a post (protected route) |
| /unlike_post/:post_id   | Unlikes a post (protected route) |
| /bookmark_post/:post_id   | Bookmarks a post (protected route) |
| /unbookmark_post/:post_id   | Removes the bookmarked  post (protected route) |


COMMENT BASE ROUTE: http://localhost:4000/:post_id/
| Route      | Function               |
|------------|------------------------|
| /add_comment | Adds comment to a post|

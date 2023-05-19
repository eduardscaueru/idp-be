import {Request, Response} from "express";
import * as HttpStatus from "http-status";
import {Post} from "../entity/post";
import {User} from "../entity/user";
import jwt_decode from 'jwt-decode';

var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config/properties');

const fetch = require("node-fetch");

class PostController {
    static createPost = async (req: Request, res: Response) => {
        let {title, body} = req.body;
        let groupId = req.params.groupId;
        let token: any = jwt_decode(req.headers.authorization?.slice(7)!);
        let userId = token.userId;

        try {
            await fetch(properties.get("post_db_url") + 'createPost', {
                method: 'POST',
                body: JSON.stringify({title: title, body: body, userId: userId, groupId: groupId}),
                headers: {
                  'Content-type': 'application/json'
                }}).then(response => {
                  return response.json()
              }).then(data => {
                  console.log(data)
              }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
              });

            res.status(HttpStatus.CREATED).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

    static likePost = async (req: Request, res: Response) => {
        let token: any = jwt_decode(req.headers.authorization?.slice(7)!);
        let userId = token.userId;
        const postId = req.params.postId;

        try {
            let user;
            await fetch(properties.get("user_db_url") + 'findOneOrFail', {
                method: 'POST',
                body: JSON.stringify({ where: { id: userId }, relations: ["likedPosts"] }),
                headers: {
                'Content-type': 'application/json'
                }}).then(response => {
                return response.json()
            }).then(data => {
                console.log(data);
                user = User.from(data);
            }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });

            let post;
            await fetch(properties.get("post_db_url") + 'findOneOrFail', {
                method: 'POST',
                body: JSON.stringify({ where: { id: postId }, relations: ["userLikes"] }),
                headers: {
                'Content-type': 'application/json'
                }}).then(response => {
                return response.json()
            }).then(data => {
                console.log(data);
                post = Post.from(data);
            }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });

            if (user.likedPosts == null) {
                user.likedPosts = [];
            }

            if (post.userLikes == null) {
                post.userLikes = [];
            }

            if (user.likedPosts.includes(post) || post.userLikes.includes(user)) {
                res.status(HttpStatus.CONFLICT).send();
                return;
            }

            user.likedPosts.push(Post.from(post.toJSON()));
            post.userLikes.push(User.from(user.toJSON()));

            // Update user
            await fetch(properties.get("user_db_url") + 'update', {
                method: 'POST',
                body: JSON.stringify(user),
                headers: {
                'Content-type': 'application/json'
                }}).then(response => {
                return response.json()
            }).then(data => {
                console.log(data)
            }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });
            // Update post
            await fetch(properties.get("post_db_url") + 'update', {
                method: 'POST',
                body: JSON.stringify(post),
                headers: {
                'Content-type': 'application/json'
                }}).then(response => {
                return response.json()
            }).then(data => {
                console.log(data)
            }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });

            res.status(HttpStatus.OK).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

    static unlikePost = async (req: Request, res: Response) => {
        let token: any = jwt_decode(req.headers.authorization?.slice(7)!);
        let userId = token.userId;
        const postId = req.params.postId;

        try {
            let user;
            await fetch(properties.get("user_db_url") + 'findOneOrFail', {
                method: 'POST',
                body: JSON.stringify({ where: { id: userId }, relations: ["likedPosts"] }),
                headers: {
                'Content-type': 'application/json'
                }}).then(response => {
                return response.json()
            }).then(data => {
                console.log(data);
                user = User.from(data);
            }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });

            let post;
            await fetch(properties.get("post_db_url") + 'findOneOrFail', {
                method: 'POST',
                body: JSON.stringify({ where: { id: postId }, relations: ["userLikes"] }),
                headers: {
                'Content-type': 'application/json'
            }}).then(response => {
                console.log(response);
                return response.json()
            }).then(data => {
                console.log(data);
                post = Post.from(data);
            }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });

            user.likedPosts = user.likedPosts.filter(p => p.id != post.id);
            post.userLikes = post.userLikes.filter(u => u.id != user.id);

            // Update user
            await fetch(properties.get("user_db_url") + 'update', {
                method: 'POST',
                body: JSON.stringify(user),
                headers: {
                'Content-type': 'application/json'
                }}).then(response => {
                return response.json()
            }).then(data => {
                console.log(data)
            }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });
            // Update post
            await fetch(properties.get("post_db_url") + 'update', {
                method: 'POST',
                body: JSON.stringify(post),
                headers: {
                'Content-type': 'application/json'
                }}).then(response => {
                return response.json()
            }).then(data => {
                console.log(data)
            }).catch(error => {
                console.error('Error:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });

            res.status(HttpStatus.OK).send();
        } catch (e) {
            console.log(e);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }

}

export default PostController;

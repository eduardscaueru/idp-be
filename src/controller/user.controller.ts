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
        let token: any = jwt_decode(req.headers.authorization?.slice(7)!);
        let userId = token.userId;

        try {
            await fetch(properties.get("user_db_url") + 'update', {
                method: 'POST',
                body: req.body,
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
}
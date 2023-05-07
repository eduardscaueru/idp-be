import {Request, Response} from "express";
import {Group} from "../entity/group";
import {validate} from "class-validator";
import * as HttpStatus from 'http-status';
import {User} from "../entity/user";
import jwt_decode from 'jwt-decode';

var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('config/properties');

const fetch = require("node-fetch");

class GroupController {
    static listAll = async (req: Request, res: Response) => {

      let groups;
      await fetch(properties.get("group_db_url") + 'find', {
        method: 'POST',
        body: JSON.stringify({select: ["id", "name", "description"]}),
        headers: {
          'Content-type': 'application/json'
        }}).then(response => {
          return response.json()
      }).then(data => {
          console.log(data)
          groups = data;
      }).catch(error => {
        console.error('Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });

      return res.send(groups);
    }

    static createGroup = async (req: Request, res: Response) => {
        let {name, description} = req.body;
        let group = new Group();
        group.name = name;
        group.description = description;
        group.image = "";
        group.imageString = "";

        const errors = await validate(group);
        if (errors.length > 0) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errors);
            return;
        }

        var code = null as any;
        try {
          console.log(properties.get("group_db_url") + 'create')
          await fetch(properties.get("group_db_url") + 'create', {
            method: 'POST',
            body: JSON.stringify(group),
            headers: {
              'Content-type': 'application/json'
            }}).then(response => {
              code = response.status;
              return response.json()
          }).then(data => {
              console.log(data)
          }).catch(error => {
            console.error('Error:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
          });
        } catch (e) {
            console.error(e);
            res.status(HttpStatus.CONFLICT).send("Failed to create group");
            return;
        }

        res.status(HttpStatus.CREATED).send(group);
    }

  static getGroup = async (req: Request, res: Response) => {
      const groupId = req.params.groupId;
      var code = null as any;
      try {
        await fetch(properties.get("group_db_url") + 'get/' + groupId, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          }}).then(response => {
            code = response.status;
            return response.json()
        }).then(data => {
            console.log(data)
            res.status(HttpStatus.OK).send(data);
        }).catch(error => {
          console.error('Error:', error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        });
      } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
  }

  static getGroupsUserNotIn = async (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
      // const user = await getRepository(User).findOneOrFail({ where: { id: userId } });
      let user;
      var code = null as any;
      await fetch(properties.get("user_db_url") + 'get/id/' + userId, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }}).then(response => {
          code = response.status;
          return response.json()
      }).then(data => {
          user = User.from(data);
          console.log(data);
      }).catch(error => {
        console.error('Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });

      let groups;
      await fetch(properties.get("group_db_url") + 'find', {
        method: 'POST',
        body: JSON.stringify({relations: ["users"]}),
        headers: {
          'Content-type': 'application/json'
        }}).then(response => {
          code = response.status;
          return response.json()
      }).then(data => {
          console.log(data);
          groups = data;
      }).catch(error => {
        console.error('Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });


      const groupsWithoutUser: any = [];
      for (let g of groups) {
        let inGroup = false;
        for (let u of g.users) {
          if (user.id === u.id) {
            inGroup = true;
          }
        }
        if (!inGroup) {
          groupsWithoutUser.push(g);
        }
      }

      for (let g of groupsWithoutUser) {
        try {
          await fetch(properties.get("post_db_url") + 'getPhoto', {
            method: 'POST',
            body: JSON.stringify({image: g.image}),
            headers: {
              'Content-type': 'application/json'
            }}).then(response => {
              return response.json()
          }).then(data => {
              console.log(data);
              g.imageString = data.imageString;
          }).catch(error => {
            console.error('Error:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
          });

        } catch (e) {
          console.log(e);
        }
      }
      res.status(HttpStatus.OK).send(groupsWithoutUser);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static getGroupsUserIn = async (req: Request, res: Response) => {
    const id = req.params.userId;
    try {
      let user; //await getRepository(User).findOneOrFail({ where: { id }, relations: ["groups"] });
      await fetch(properties.get("user_db_url") + 'findOneOrFail', {
        method: 'POST',
        body: JSON.stringify({where: {id}, relations: ["groups"]}),
        headers: {
          'Content-type': 'application/json'
        }}).then(response => {
          console.log(response)
          return response.json()
      }).then(data => {
          console.log(data)
          user = User.from(data)
      }).catch(error => {
        console.error('Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });

      for (let g of user.groups) {
        try {
          await fetch(properties.get("post_db_url") + 'getPhoto', {
            method: 'POST',
            body: JSON.stringify({image: g.image}),
            headers: {
              'Content-type': 'application/json'
            }}).then(response => {
              return response.json()
          }).then(data => {
              g.imageString = data.imageString
          }).catch(error => {
            console.error('Error:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
          });

        } catch (e) {
          console.log(e);
        }
      }
      res.status(HttpStatus.OK).send(user.groups);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static groupJoin = async (req: Request, res: Response) => {
    let groupId = req.params.groupId;
    let token: any = jwt_decode(req.headers.authorization?.slice(7)!);
    let userId = token.userId;

    try {
      let group: Group = new Group();
      await fetch(properties.get("group_db_url") + 'findOneOrFail', {
        method: 'POST',
        body: JSON.stringify({where: {id: groupId }, relations: ["users"]}),
        headers: {
          'Content-type': 'application/json'
        }}).then(response => {
          return response.json()
      }).then(data => {
          console.log(data)
          group = Group.from(data);
      }).catch(error => {
        console.error('Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });
      
      let user: User = new User();
      await fetch(properties.get("user_db_url") + 'findOneOrFail', {
        method: 'POST',
        body: JSON.stringify({where: {id: userId }, relations: ["groups"]}),
        headers: {
          'Content-type': 'application/json'
        }}).then(response => {
          return response.json();
      }).then(data => {
          console.log(data);
          user = User.from(data);
      }).catch(error => {
        console.error('Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });

      group.users.push(User.from(user.toJSON()));
      user.groups.push(Group.from(group.toJSON()));
      let response = {success: "Approved!"};
      
      // Update user
      await fetch(properties.get("user_db_url") + 'update', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
          'Content-type': 'application/json'
        }}).then(response => {
          return response.json()
      }).then(data => {
          console.log(data);
      }).catch(error => {
        console.error('Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });
      // Update group
      await fetch(properties.get("group_db_url") + 'update', {
        method: 'POST',
        body: JSON.stringify(group),
        headers: {
          'Content-type': 'application/json'
        }}).then(response => {
          return response.json();
      }).then(data => {
          console.log(data);
      }).catch(error => {
        console.error('Error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });

      res.status(HttpStatus.OK).send(response);
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  static getPosts = async (req: Request, res: Response) => {
    let lastIndex = req.params.lastIndex;
  
    const groupId = req.params.groupId;
    let token: any = jwt_decode(req.headers.authorization?.slice(7)!);
    const userId = token.userId;
  
    try {
        let posts;
        await fetch(properties.get("group_db_url") + 'getPosts', {
          method: 'POST',
          body: JSON.stringify({groupId: groupId, userId: userId, lastIndex: lastIndex}),
          headers: {
            'Content-type': 'application/json'
          }}).then(response => {
            return response.json()
        }).then(data => {
            console.log("Posts\n" + data);
            posts = data;
        }).catch(error => {
          console.error('Error:', error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        });
        
        res.status(HttpStatus.OK).send(posts);
    } catch (e) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

}

export default GroupController;

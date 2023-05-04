import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./user";
import {Post} from "./post";

@Entity()
export class Group {
  
  static from(json: any) {
    return Object.assign(new Group(), json);
  }

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  image!: string;

  @Column()
  imageString!: string;

  @ManyToMany(() => User, user => user.groups)
  @JoinTable({name: 'group_user'})
  users!: User[];

  @ManyToMany(() => User, user => user.moderatedGroups)
  @JoinTable({name: 'group_moderator'})
  moderators!: User[];

  @OneToMany(() => Post, post => post.group)
  posts!: Post[]
}

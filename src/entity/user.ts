import {
  Column, CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";
import {classToPlain, Exclude} from "class-transformer";
import { Group } from "./group";
import { Post } from "./post";

@Entity()
@Unique(["username"])
export class User {

  static from(json: any) {
    return Object.assign(new User(), json);
  }

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  // @Exclude({ toPlainOnly: true })
  password!: string;

  @Column()
  role!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  birthDate!: Date;

  @Column()
  email!: string;

  @Column()
  university!: string;

  @Column()
  imageString!: string;

  @Column()
  profilePic!: string;

  @ManyToMany(() => Group, group => group.users)
  @JoinTable({name: 'group_user'})
  groups!: Group[];

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  @ManyToMany(() => Post, post => post.userLikes)
  @JoinTable({ name: 'user_like' })
  likedPosts!: Post[];

  @ManyToMany(() => Group, group => group.moderators)
  moderatedGroups!: Group[];

  hashPassword() {
      // this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {

    return unencryptedPassword == this.password;
    // return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  toJSON() {
    return classToPlain(this);
  }
}

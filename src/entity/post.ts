import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn, ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./user";
import {Group} from "./group";
import {PostFile} from "./postFile";

@Entity()
export class Post {

    static from(json: any) {
        return Object.assign(new Group(), json);
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({default: ""})
    bodyText!: string;

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn()
    author!: User;

    @ManyToOne(() => Group, group => group.posts)
    @JoinColumn()
    group!: Group;

    @CreateDateColumn()
    createDate!: Date;

    @OneToMany(() => PostFile, postFile => postFile.post)
    postFiles!: PostFile[]

    @ManyToMany(() => User, user => user.likedPosts)
    userLikes!: User[]

    /* --- */
    likeCount!: number;
    alreadyLiked!: boolean;
    userLikesIds!: number[];
    timeCreatedString!: string;
}
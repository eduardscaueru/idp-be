import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./post";

@Entity()
export class PostFile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    fileName!: string;

    @ManyToOne(() => Post, post => post.postFiles)
    @JoinColumn()
    post!: Post;
}

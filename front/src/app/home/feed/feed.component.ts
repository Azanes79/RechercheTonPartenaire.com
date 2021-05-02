import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Post } from '../../_shared/_models/post';
import { UserReact } from '../../_shared/_models/userReact';
import { AuthService } from '../../_shared/_services/auth.service';
import { SocketIoService } from '../../_shared/_services/io.service';
import { PostService } from '../../_shared/_services/post.service';
import { InfoPubliComponent } from '../info-publi/info-publi.component';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {


  public posts: Post[] = [];
  public visibility: string = 'all';
  constructor(public dialog: MatDialog, private ioService: SocketIoService, private postService: PostService, private authService: AuthService) {
    this.subscribeToPosts();
  }

  ngOnInit() {
    this.postService.getPosts().subscribe(_posts => {
      this.posts = _posts;
    })
  }


  openDialog(post: Post): void {
    const dialogRef = this.dialog.open(InfoPubliComponent, {
      width: '320px',
      data: { post: post }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  private subscribeToPosts(): void {
    this.ioService.getPost()
      .subscribe((data: { event: string, post: Post }) => {
        let i;
        switch (data.event) {
          case 'post':
            this.posts.unshift(data.post);
            break;
          case 'like':
          case 'unLike':
            i = this.posts.findIndex(_post => _post._id === data.post._id);
            this.posts[i].likes = data.post.likes;
            break;
          case 'share':
          case 'unShare':
            i = this.posts.findIndex(_post => _post._id === data.post._id);
            this.posts[i].shares = data.post.shares;
            break;
          default:
            break;
        }
      });
  }


  sendLike(post: Post) {
    if (post.likes.find(_e => _e.user.FirebaseId === this.authService.user.FirebaseId)) {
      post.likes = post.likes.filter(_e => _e.user.FirebaseId !== this.authService.user.FirebaseId)
    } else {
      post.likes.push(new UserReact(this.authService.user))
    }

    this.postService.updatePosts(post).subscribe(_res => {
      this.broadcastLike(post);
    });
  }


  sendShare(post: Post) {
    if (post.shares.find(_e => _e.user.FirebaseId === this.authService.user.FirebaseId)) {
      post.shares = post.shares.filter(_e => _e.user.FirebaseId !== this.authService.user.FirebaseId)
    } else {
      post.shares.push(new UserReact(this.authService.user))
    }

    this.postService.updatePosts(post).subscribe(_res => {
      this.broadcastShare(post);
    });
  }

  public broadcastShare(post: Post): void {
    this.ioService.sendShare(post);
  }

  public broadcastLike(post: Post): void {
    this.ioService.sendLike(post);
  }

  isLike(post: Post) {
    if (this.authService.user) {
      return post.likes.find(_data => _data.user.FirebaseId === this.authService.user.FirebaseId) ? true : false;
    } else {
      return false;
    }

  }

  isShare(post: Post) {
    if (this.authService.user) {
      return post.shares.find(_data => _data.user.FirebaseId === this.authService.user.FirebaseId) ? true : false;
    } else {
      return false;
    }
  }

  isUserPost(post: Post) {
    if (this.authService.user) {
      return post.user.FirebaseId === this.authService.user.FirebaseId ? true : false;
    } else {
      return false;
    }
  }

}

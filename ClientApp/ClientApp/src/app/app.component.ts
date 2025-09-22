import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { UserInfo } from './models/auth.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ClientApp';
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<UserInfo | null>;

  constructor(
    private authService: AuthService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Component initialization
  }
}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [],
  template: `
  <div class="container">
    <div class="row">
      <div class="col-md-12" style="height: 90vh;text-align: center; justify-content: center; align-items: center; display: flex;">
        <h2>{{response}}</h2>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12" style="height: 10vh;text-align: center; justify-content: center; align-items: center; display: flex;">
        <a href="/login">Giriş Yap</a>
      </div>
      </div>
    </div>
  `,


})
export class ConfirmEmailComponent {
  email: string = '';
  response: string = 'E-posta adresiniz onaylanıyor...';



  constructor(private activated: ActivatedRoute, private http: HttpService) {
    this.activated.params.subscribe(res => {
      this.email = res['email'];
      this.emailConfirm();
    });
  }

  emailConfirm() {
    this.http.post<string>('Auth/ConfirmEmail', { email: this.email }, (res) => {
      this.response = res;
    }
    );
  }
}

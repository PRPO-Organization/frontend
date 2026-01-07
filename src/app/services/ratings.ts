import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Ratings {
  private API_URL = `${environment.RATINGS_URL}/api/ratings`

  
}

import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  groceryItems: string[] = [
    'Apples',
    'Cheesecake',
    'Celery',
    'Green Tea',
    'Burgers',
    'Tuna',
    'Pasta',
  ];

  newItem: string = '';
  constructor( 
    private alertController: AlertController,
    private sqlite: SQLite,
    private sqlitePorter: SQLitePorter,
    private nativeStorage: NativeStorage
    ) {
      this.initDatabase();
  }

  async initDatabase() {
    try {
      const db = await this.sqlite.create({
        name: 'groceries.db',
        location: 'default',
      });

      await this.createTable(db);

      this.nativeStorage.getItem('groceryItems').then(
        (data) => {
          if (data && data.length) {
            this.groceryItems = data;
          }
        },
        (error) => {
          console.error('Error retrieving grocery items from Native Storage', error);
        }
      );
    } catch (error) {
      console.error('Error opening database', error);
    }
  }
  async createTable(db: SQLiteObject) {
    const createTableQuery = 'CREATE TABLE IF NOT EXISTS groceries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)';

    try {
      await db.executeSql(createTableQuery, []);
    } catch (error) {
      console.error('Error creating table', error);
    }
  }

  async addItem() {
    if (this.newItem.trim() !== '') {
      try {
        const db = await this.sqlite.create({
          name: 'groceries.db',
          location: 'default',
        });

        const insertQuery = 'INSERT INTO groceries (name) VALUES (?)';
        await db.executeSql(insertQuery, [this.newItem.trim()]);
        this.groceryItems.push(this.newItem.trim());
        this.newItem = '';

        this.nativeStorage.setItem('groceryItems', this.groceryItems).then(
          () => {},
          (error) => {
            console.error('Error storing grocery items in Native Storage', error);
          }
        );
      } catch (error) {
        console.error('Error opening database', error);
      }
    }
  }

  async deleteItem(item: string) {
    try {
      const db = await this.sqlite.create({
        name: 'groceries.db',
        location: 'default',
      });

      const deleteQuery = 'DELETE FROM groceries WHERE name = ?';
      await db.executeSql(deleteQuery, [item]);

      const index = this.groceryItems.indexOf(item);
      if (index !== -1) {
        this.groceryItems.splice(index, 1);
      }

      this.nativeStorage.setItem('groceryItems', this.groceryItems).then(
        () => {},
        (error) => {
          console.error('Error storing grocery items in Native Storage', error);
        }
      );
    } catch (error) {
      console.error('Error opening database', error);
    }
  }
}
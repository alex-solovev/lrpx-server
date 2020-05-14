import {
  Entity,
  ObjectIdColumn,
  ObjectID,
  Column,
  BeforeInsert,
} from 'typeorm';
import { IsEmail, Length, validate } from 'class-validator';
import bcrypt from 'bcryptjs';

@Entity({ name: 'accounts' })
export default class User {
  @ObjectIdColumn()
  id: ObjectID;

  @Column({ unique: true })
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @Column()
  @Length(8, 32)
  password: string;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    const { password } = this;
    const hashedPassword = await bcrypt.hash(password, 10);
    this.password = hashedPassword;
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async validate(): Promise<void> {
    const errors = await validate(this);

    if (errors.length) {
      throw new Error('Validation Failed');
    }
  }
}

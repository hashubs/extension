import { Store } from 'store-unit';
import { retrieve } from './persistence';

export enum ThemePreference {
  system,
  light,
  dark,
}

export interface State {
  mode: ThemePreference;
  currency: string;
  hideBalances: boolean;
  enableAnimation: boolean;
}

const initialState = {
  mode: ThemePreference.system,
  currency: 'usd',
  hideBalances: false,
  enableAnimation: true,
};

export const preferenceStore = new Store<State>({
  ...initialState,
  ...retrieve(),
});

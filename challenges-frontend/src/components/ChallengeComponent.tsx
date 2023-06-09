import React, { ChangeEvent, FormEvent } from "react";
import ApiClient from "../services/ApiClient";
import LastAttemptsComponent from './LastAttemptsComponent';
import { ChallengeAttempt } from "./ChallengeAttempt";

interface ChallengeState {
  a: number;
  b: number;
  user: string;
  message: string;
  guess: number;
  lastAttempts: Array<ChallengeAttempt>;
}

class ChallengeComponent extends React.Component<{}, ChallengeState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      a: 0,
      b: 0,
      user: "",
      message: "",
      guess: 0,
      lastAttempts: [],
    };
    this.handleSubmitResult = this.handleSubmitResult.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(): void {
    ApiClient.challenge().then((res: Response) => {
      if (res.ok) {
        res.json().then((json: { factorA: number; factorB: number }) => {
          this.setState({
            a: json.factorA,
            b: json.factorB,
          });
        });
      } else {
        this.updateMessage("Can't reach the server");
      }
    });
  }

  handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const name = event.target.name;
    this.setState((prevState) => ({
      ...prevState,
      [name]: event.target.value,
    }));
  }

  handleSubmitResult(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    ApiClient.sendGuess(
      this.state.user,
      this.state.a,
      this.state.b,
      this.state.guess
    ).then((res: Response) => {
      if (res.ok) {
        res.json().then((json: { correct: boolean; resultAttempt: string }) => {
          if (json.correct) {
            this.updateMessage("Congratulations! Your guess is correct");
          } else {
            this.updateMessage(
              `Oops! Your guess ${json.resultAttempt} is wrong, but keep playing!`
            );
          }
          this.updateLastAttempts(this.state.user);
          // this.refreshChallenge(); 
        });
      } else {
        this.updateMessage("Error: server error or not available");
      }
    });
  }

  updateLastAttempts(userAlias: string): void {
    ApiClient.getAttempts(userAlias).then((res: Response) => {
      if (res.ok) {
        res.json().then((data: ChallengeAttempt[]) => {
          this.setState({
            lastAttempts: data,
          });
        });
      }
    });
  }

  updateMessage(m: string): void {
    this.setState({
      message: m,
    });
  }

  render(): JSX.Element {
    return (
      <div className="display-column">
        <div>
          <h3>Your new challenge is</h3>
          <div className="challenge">
            {this.state.a} x {this.state.b}
          </div>
        </div>
        <form onSubmit={this.handleSubmitResult}>
          <label>
            Your alias:
            <input
              type="text"
              maxLength={12}
              name="user"
              value={this.state.user}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            Your guess:
            <input
              type="number"
              min={0}
              name="guess"
              value={this.state.guess}
              onChange={this.handleChange}
            />
          </label>
          <br />
          <input type="submit" value="Submit" />
        </form>
        <h4>{this.state.message}</h4>
        {this.state.lastAttempts.length > 0 &&
          <LastAttemptsComponent lastAttempts={this.state.lastAttempts}/>
 }
      </div>
    );
  }
}

export default ChallengeComponent;

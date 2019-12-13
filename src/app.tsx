import React, {PureComponent} from 'react';
import {Autowired, Consumer} from "coreact";
import {Networking} from "./networking";

@Consumer
export class App extends PureComponent {
  net = Autowired(Networking, this);
  state = {
    data: '',
    blocks: [] as any[],
  };
  changeData = (data: string) => this.setState({data});

  componentDidMount(): void {
    this.net.GET('/blocks').then(response => {
      this.setState({blocks: response.payload})
    })
  }

  render() {
    const {data, blocks} = this.state;
    return <>
      <div>
        <input type="text" value={data} onChange={e => this.changeData(e.target.value)}/>
        <button onClick={async () => {
          const response = await this.net.POST('/transact', {
            recipient: '09364003675', amount: 100,
          });
          this.setState({blocks: response.payload})
        }}>submit
        </button>
      </div>

      <div>
        <pre>{JSON.stringify(blocks, null, '  ')}</pre>
      </div>
    </>
  }
}

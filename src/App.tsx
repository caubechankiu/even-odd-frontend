import React, { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import { web3, evenOddContract } from "./web3";

function App() {
  const [owner, setOwner] = useState("");
  const [totalBetEven, setTotalBetEven] = useState(0);
  const [totalBetOdd, setTotalBetOdd] = useState(0);
  const [weiToBetEven, setWeiToBetEven] = useState(0);
  const [weiToBetOdd, setWeiToBetOdd] = useState(0);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [lastDoorOpen, setLastDoorOpen] = useState(0);

  useEffect(() => {
    syncAccount();
    getOwner();
  }, []);

  useEffect(() => {
    syncTotalBet();
  }, []);

  const subscribeEvent = () => {
    evenOddContract.events.BetEvent({})
      .on("data", (event: any) => {
        const door = Number(event.returnValues.door);
        const value = Number(event.returnValues.value);
        if (Number(door) === 0) {
          setTotalBetEven(totalBetEven + value);
        } else if (Number(door) === 1) {
          setTotalBetOdd(totalBetOdd + value);
        }
      });

    evenOddContract.events.DoorOpenEvent({})
      .on("data", (event: any) => {
        const door = Number(event.returnValues.door);
        setLastDoorOpen(door);
        setTotalBetEven(0);
        setTotalBetOdd(0);
      });
  }
  subscribeEvent();

  const syncAccount = async () => {
    console.log("syncAccount");
    const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts[0]) {
      setAccount(accounts[0]);
    }
    (window as any).ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts[0]) {
        setAccount(accounts[0]);
        const balance = await web3.eth.getBalance(accounts[0]);
        setBalance(Number(balance));
      }
    })
  }

  const getTotalBet = async () => {
    console.log("getTotalBet")
    return evenOddContract.methods.getTotalBet().call();
  }

  const syncTotalBet = async () => {
    console.log("syncTotalBet")
    const totalBet = await getTotalBet();
    setTotalBetEven(Number(totalBet[0]));
    setTotalBetOdd(Number(totalBet[1]));
  }

  const betDoor = async (door: number) => {
    console.log("betDoor");
    if (door === 0) {
      await evenOddContract.methods.bet(door).send({ from: account, value: weiToBetEven });
      setWeiToBetEven(0);
    } else if (door === 1) {
      await evenOddContract.methods.bet(door).send({ from: account, value: weiToBetOdd });
      setWeiToBetOdd(0);
    }
  }

  const random = async () => {
    await evenOddContract.methods.randomDoor().send({ from: account });
  }

  const getOwner = async () => {
    const owner = await evenOddContract.methods.owner().call();
    setOwner(owner);
  }

  return (
    <div>
      <h1>Account: {account}, balance: {balance} Wei</h1>
      <div style={{ width: '100%', display: "flex", alignItems: "center" }}>
        <h1 style={{ margin: 0, flex: 1 }}>Chẵn</h1>
        <h1 style={{ margin: 0, flex: 1 }}>{`Tổng tiền đặt: ${totalBetEven} Wei`}</h1>
        <Input.Group style={{ flex: 1 }} compact>
          <Input style={{ width: 'calc(100% - 100px)' }} type="number" min={0} onChange={e => setWeiToBetEven(Number(e.target.value))} value={weiToBetEven} />
          <Button style={{ width: '100px' }} onClick={() => betDoor(0)} type="primary">Đặt Cửa</Button>
        </Input.Group>
      </div>
      <div style={{ width: '100%', display: "flex", alignItems: "center" }}>
        <h1 style={{ margin: 0, flex: 1 }}>Lẻ</h1>
        <h1 style={{ margin: 0, flex: 1 }}>{`Tổng tiền đặt: ${totalBetOdd} Wei`}</h1>
        <Input.Group style={{ flex: 1 }} compact>
          <Input style={{ width: 'calc(100% - 100px)' }} type="number" min={0} onChange={e => setWeiToBetOdd(Number(e.target.value))} value={weiToBetOdd} />
          <Button style={{ width: '100px' }} onClick={() => betDoor(1)} type="primary">Đặt Cửa</Button>
        </Input.Group>
      </div>
      {owner && account && owner.toLowerCase() === account.toLowerCase() ? <div style={{ width: "100%", marginTop: "30px", display: "flex", justifyContent: "center" }}>
        <Button type="primary" onClick={() => random()}>Quay</Button>
      </div> : null}
      <div style={{ width: "100%", marginTop: "30px", display: "flex", justifyContent: "center" }}>
        <h1>Kết quả: {lastDoorOpen === 0 ? "Chẵn" : "Lẻ"}</h1>
      </div>
    </div>
  );
}

export default App;

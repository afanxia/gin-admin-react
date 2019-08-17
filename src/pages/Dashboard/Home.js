import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Home.less';
import Socket from '../../components/websocket';
// import getAccessToken from '../../utils/request';
// import { notification } from 'antd';
// import moment from 'moment';
import store from '../../utils/store';

@connect(state => ({
  global: state.global,
}))
class Home extends PureComponent {
  constructor() {
    super();
    this.taskRemindInterval = null;
    this.socket = null;
  }

  state = {
    currentTime: moment().format('HH:mm:ss'),
    rcvmsg: 'lht',
  };

  // receiveMsg = {
  //   rcvmsg: "lht",
  // };

  componentDidMount = () => {
    let tk = '';
    const tokenInfo = store.getAccessToken();
    if (tokenInfo) {
      tk = `${tokenInfo.access_token}`;
    }

    //    判断专家是否登录
    this.socket = new Socket({
      socketUrl: `ws://127.0.0.1:10088/api/v1/pub/ping?token=${tk}`,
      timeout: 5000,
      socketMessage: receive => {
        console.log(receive); // 后端返回的数据，渲染页面
        this.setState({ rcvmsg: receive.data });
      },
      socketClose: msg => {
        console.log(msg);
      },
      socketError: () => {
        // eslint-disable-next-line react/destructuring-assignment
        console.log(`连接建立失败`);
      },
      socketOpen: () => {
        console.log('连接建立成功');
        // 心跳机制 定时向后端发数据
        this.taskRemindInterval = setInterval(() => {
          //  this.socket.sendMessage({ "msgType": 0 })
          this.socket.sendMessage('ping');
        }, 3000);
      },
    });

    // 重试创建socket连接
    try {
      this.socket.connection();
    } catch (e) {
      // 捕获异常，防止js error
      // do nothing
    }

    this.interval = setInterval(() => {
      this.setState({ currentTime: moment().format('HH:mm:ss') });
    }, 1000);
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getHeaderContent = () => {
    const {
      global: { user },
    } = this.props;

    const { role_names: roleNames } = user;

    const text = [];
    if (roleNames && roleNames.length > 0) {
      text.push(
        <span key="role" style={{ marginRight: 20 }}>{`所属角色：${roleNames.join('/')}`}</span>
      );
    }

    if (text.length > 0) {
      return text;
    }
    return null;
  };

  render() {
    const {
      global: { user },
    } = this.props;

    const { currentTime, rcvmsg } = this.state;

    const breadcrumbList = [{ title: '首页' }];

    return (
      <PageHeaderLayout
        title={`您好，${user.real_name}，祝您开心每一天！`}
        breadcrumbList={breadcrumbList}
        content={this.getHeaderContent()}
        action={<span>当前时间：{currentTime}</span>}
      >
        <p> 接收数据： {rcvmsg} </p>
        <div className={styles.index} />
      </PageHeaderLayout>
    );
  }
}

export default Home;

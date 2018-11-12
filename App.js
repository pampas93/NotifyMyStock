import React from 'react';
import { FlatList, ActivityIndicator, Text, View, Button, TextInput, ListItem, Alert, AsyncStorage } from 'react-native';

class Stock {
  constructor(symbol, name) {
    this.symbol = symbol;
    this.name = name;
  }
}

export default class App extends React.Component {

  constructor(props){
    super(props);
    this.state = { text: 'Enter stock symbol', 
      stocks: [],
      isLoading: true,
      errorCode: 100};
    this._retrieveData();
  }

  ReturnErrorString = () => {
    switch(this.state.errorCode){
      case 100: return "No Error";
      case 101: return "Failed to load data from phone storage. Restart the app";
      case 102: return "Failed to store data into phone storage. Please check the permissions";
      case 103: return "Failed to fetch stock. Check the Stock symbol again, or Internet connection";
    }
  }

  AddStock = () => {
    var newStock = this.state.text;
    this.setState({isLoading: true});
    fetch('https://api.iextrading.com/1.0/stock/'+ newStock + '/company')
      .then((response) => response.json())
      .then((responseJson) => {
        var x = this.state.stocks;
        var symbol = responseJson.symbol;
        var newObj = new Stock(symbol, responseJson.companyName);
        if(x.findIndex(v => v.symbol === symbol) === -1){
          x.push(newObj);
          this.setState({stocks: x, isLoading: false});
          this._storeData();
        }
      })
      .catch((error) => {
        this.setState({errorCode: 103, isLoading: false});
        this.ShowAlert();
      });
  }

  ShowAlert = () => {
    Alert.alert(
        'Error',
        this.ReturnErrorString(),
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: false }
    )
  }

  _storeData = async () => {
    try {
      await AsyncStorage.setItem('STOCKS', JSON.stringify(this.state.stocks));
    } catch (error) {
      this.setState({errorCode: 102});
      console.log("Error saving data into phone storage");
    }
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('STOCKS');
      if (value !== null) {
        console.log(value);
        this.setState({stocks: JSON.parse(value), 
          isLoading: false, 
          errorCode: 100});
      }
      else{
        console.log("Not data retrived");
        this.setState({isLoading: false, 
          errorCode: 101});
      }
    } catch (error) {
      console.log("Error retrieving data from phone storage");
      this.setState({isLoading: false, 
        errorCode: 101});
    }
  }

  OnPressLearnMore() {
    // this.setState(this.state.stocks: newArray);
    // fetch('https://api.iextrading.com/1.0/stock/aapl/price')
    // .then((response) => response.json())
    // .then((responseJson) => {
    //   console.log(responseJson);
    // })
    // .catch((error) => {
    //   console.error(error);
    // });
  }

  deleteItem = (symbol) => {
    var x = this.state.stocks;
    x.splice(x.findIndex(v => v.symbol === symbol), 1);
    this.setState({stocks: x})
    this._storeData();
  }

  renderStock = ({item, index}) => {
    return(
      <View>
        <Text>{item.name}</Text>
        <Button onPress={()=> this.deleteItem(item.symbol)} title="Delete item" />
      </View>
    )
  }

  render(){

    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }

    return(
      <View style={{flex: 1, padding:50}}>

        <TextInput
          onChangeText={(text) => this.setState({text})}
          placeholder="Enter stock symbol"
        />
      
        <Button style={{flex: 1, margin:40}}
          onPress={this.AddStock}
          title="Add Stock"
          accessibilityLabel="Learn more about this purple button"
        />
          <FlatList style={{paddingTop:25, padding:10}}
          data = {this.state.stocks}
          extraData = {this.state}
          renderItem = {this.renderStock}
          //renderItem={({ item }) => <Text>{item.name} </Text> }
          keyExtractor={({id}, index) => id}
          /> 
      </View>
    );
  }
}

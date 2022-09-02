import React, { useState } from "react";
import { SafeArea } from "../../../components/utils/safe-area.component";
import { firebaseSDK } from "../../../libs/firebase";
import { SignUpHeaderComponent } from "./components/header.component";
import { PhoneVerifyScreen } from "./phone-verify";
import { PincodeVerifyScreen } from "./pincode-verify";
import { Alert } from "react-native";
import { BasicInformationScreen } from "./basic-information";
import { AddAvatarScreen } from "./addavatar";
import { AuthLoading, AuthLoadingContainer } from "../styles";
import { KeyboardView } from "../../../components/utils/keyboardview.component";
import { useDispatch } from "react-redux";
import ImageResizer from "react-native-image-resizer";
import auth from "@react-native-firebase/auth";
import { LOGIN_ACTION } from "../../../constants/redux";

export const SignUpScreen = ({ navigation }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUsername ] = useState('');
  const dispatch = useDispatch();

  const onBack = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    } else {
      navigation.pop();
    }
  };

  const sendCode = async (phoneNumber) => {
    setIsLoading(true);
    try {
      // const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      const confirmation = await auth().signInWithPhoneNumber('+819012341237');
      setConfirm(confirmation);
      setIsLoading(false);
      setPageIndex(1);
    } catch (err) {
      alert('error: ' + err);
      setIsLoading(false);
    }
  };

  const verifyCode = async (code) => {
    setIsLoading(true);
    try {
      await confirm.confirm(code);
      setIsLoading(false);
      setPageIndex(2);
    } catch (error) {
      setIsLoading(false);
      if (error == null) {
        Alert.alert("Invaild code");
      } else {
        if (error.code == null) Alert.alert("Invaild code");
        else Alert.alert(error.code);
      }
    }
  };

  const setBasicInformation = (username, email, password) => {
    setUsername(username);
    setIsLoading(true);

    firebaseSDK
      .updateEmail(email)
      .then(() => {
        firebaseSDK
          .updatePassword(password)
          .then(() => {
            console.log(password);
            setIsLoading(false);
            setPageIndex(3);
          })
          .catch((error) => {
            setIsLoading(false);
            console.log(error);
          });
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
      });
  };

  const onSubmit = async (image_path, publicName) => {
    setIsLoading(true);

    ImageResizer.createResizedImage(
      image_path,
      300,
      300,
      "JPEG",
      30,
      0,
      undefined,
      false,
      { mode: "contain", onlyscaleDown: false }
    )
      .then(async (resizedImage) => {
        alert(JSON.parse(resizedImage));
        let user = await firebaseSDK.authorizedUser();

        const avatar_url = await firebaseSDK.uploadAvata(
          `${user.uid}.jpg`,
          resizedImage.path
        );

        let sendData = {
          uid: user.uid,
          about: '',
          country: '',
          createdAt: user.metadata.creationTime,
          email: user.email,
          firstName: '',
          firstname: '',
          fullName: userName,
          fullname: userName,
          isBalanceRead: true,
          isDeleted: false,
          keepMedia: 3,
          lastActive: user.metadata.lastSignInTime,
          lastTerminate: '',
          lastname: '',
          lastName: '',
          location: '',
          loginMethod: 'Phone',
          networkAudio: 3,
          networkPhoto: 3,
          networkVideo: 3,
          objectid: user.uid,
          oneSignalId: '',
          payInfo1: '',
          payInfo2: '',
          payInfo3:'',
          phone: user.phoneNumber,
          photoUrl: avatar_url,
          pictureAt: user.metadata.creationTime,
          status: 'Available',
          updatedAt: user.metadata.creationTime,
          username: userName,
          wallpaper: '',
        }

        dispatch({ type: LOGIN_ACTION.SIGNUP, user: sendData, callback: () => {
          setIsLoading(false);
          navigation.navigate('Login');
        } });
      })
      .catch((error) => {
        setIsLoading(false);
        alert(JSON.stringify(error));
      });
  };

  return (
    <>
      <SafeArea>
        <SignUpHeaderComponent onBack={onBack} pageIndex={pageIndex} />
        <KeyboardView>
          {pageIndex == 0 ? (
            <PhoneVerifyScreen onSendCode={sendCode} />
          ) : pageIndex == 1 ? (
            <PincodeVerifyScreen onVerify={verifyCode} />
          ) : pageIndex == 2 ? (
            <BasicInformationScreen setUser={setBasicInformation} />
          ) : (
            <AddAvatarScreen onSubmit={onSubmit} />
          )}
        </KeyboardView>
      </SafeArea>
      {isLoading && (
        <AuthLoadingContainer>
          <AuthLoading />
        </AuthLoadingContainer>
      )}
    </>
  );
};

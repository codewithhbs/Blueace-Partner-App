import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { colors } from '~/colors/Colors';
import Button from '~/components/form/Button';
import Input from '~/components/form/Input';
import { login } from '~/utils/api/Api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Alert from '~/components/Alert/Alert';
import { save } from '~/utils/Service/SecureStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';

interface FormInputs {
    email: string;
    phoneNumber: string;
    password: string;
}

export default function Login() {
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [formInputs, setFormInputs] = useState<FormInputs>({
        email: '',
        phoneNumber: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<FormInputs>>({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        type: '' as 'success' | 'error' | ''
    });

    const navigation = useNavigation();

    const handleInputChange = (name: keyof FormInputs, value: string) => {
        setFormInputs({ ...formInputs, [name]: value });
        setErrors({ ...errors, [name]: '' });
        setAlert({ show: false, message: '', type: '' });
    };

    const validateInputs = (): boolean => {
        let valid = true;
        const newErrors: Partial<FormInputs> = {};

        if (loginMethod === 'email') {
            if (!formInputs.email || !/\S+@\S+\.\S+/.test(formInputs.email)) {
                newErrors.email = 'Please enter a valid email';
                valid = false;
            }
        } else {
            if (!formInputs.phoneNumber || !/^\d{10}$/.test(formInputs.phoneNumber)) {
                newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
                valid = false;
            }
        }

        if (!formInputs.password || formInputs.password.length < 7) {
            newErrors.password = 'Password must be at least 7 characters';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateInputs()) return;
        // console.log("formInputs.email",formInputs.email,formInputs.phoneNumber, formInputs.password)

        setLoading(true);
        try {
            const loginIdentifier = loginMethod === 'email' ? formInputs.email : formInputs.phoneNumber;
            const data = await login(loginIdentifier, formInputs.password, formInputs.phoneNumber);

            if (data.success) {
                const { token, user } = data;
                await save('token', token);
                await save('user', user);

                setAlert({
                    show: true,
                    message: "Login Successful",
                    type: 'success'
                });
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'home' }]
                });

            } else {
                console.log("else", data?.message)
                if (data?.message === 'You are currently not eligible to start work. Please retake the test to proceed.') {
                    setAlert({
                        show: true,
                        message: 'You are not qualified in the test. Please go to the website, log in, attempt the test again, and complete your profile.',
                        type: 'error'
                    });
                }
                else {
                    setAlert({
                        show: true,
                        message: data?.message || 'Login failed',
                        type: 'error'
                    });
                }

            }
        } catch (error) {
            console.log("error in catch", error)
            setAlert({
                show: true,
                message: 'Something went wrong, please try again',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('./map_l.png')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>

                        {alert.show && (
                            <Alert
                                message={alert.message}
                                type={alert.type}
                                onClose={() => setAlert({ ...alert, show: false })}
                            />
                        )}

                        <View style={styles.loginMethodToggle}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    loginMethod === 'email' && styles.activeToggle
                                ]}
                                onPress={() => setLoginMethod('email')}
                            >
                                <Icon name="email" size={20} color={loginMethod === 'email' ? colors.white : colors.primary} />
                                <Text style={[
                                    styles.toggleText,
                                    loginMethod === 'email' && styles.activeToggleText
                                ]}>Email</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    loginMethod === 'phone' && styles.activeToggle
                                ]}
                                onPress={() => setLoginMethod('phone')}
                            >
                                <Icon name="phone" size={20} color={loginMethod === 'phone' ? colors.white : colors.primary} />
                                <Text style={[
                                    styles.toggleText,
                                    loginMethod === 'phone' && styles.activeToggleText
                                ]}>Phone</Text>
                            </TouchableOpacity>
                        </View>

                        {loginMethod === 'email' ? (
                            <Input
                                icon="email-outline"
                                keyboardType="email-address"
                                value={formInputs.email}
                                placeholder="Enter your email address"
                                onChangeText={(value) => handleInputChange('email', value)}
                                error={errors.email}
                            />
                        ) : (
                            <Input
                                icon="phone"
                                keyboardType="phone-pad"
                                value={formInputs.phoneNumber}
                                placeholder="Enter your phone number"
                                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                                error={errors.phoneNumber}
                            />
                        )}

                        <View style={styles.passwordContainer}>
                            <Input
                                icon="lock-outline"
                                secureTextEntry={!showPassword}
                                value={formInputs.password}
                                placeholder="Enter your password"
                                onChangeText={(value) => handleInputChange('password', value)}
                                error={errors.password}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Icon
                                    name={showPassword ? 'visibility-off' : 'visibility'}
                                    size={24}
                                    color={colors.primary}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://blueaceindia.com/forgot-password')}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.loginButton}
                        >
                            Sign In
                        </Button>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => Linking.openURL('https://blueaceindia.com')}>
                                <Text style={styles.signupLink}>Sign Up At Website</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    logoContainer: {
        alignItems: 'center',
        width: 'auto',
        height: 200,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    formContainer: {
        flex: 1,
        backgroundColor: colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.placeholder,
        textAlign: 'center',
        marginBottom: 32,
    },
    loginMethodToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 12,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: 8,
    },
    activeToggle: {
        backgroundColor: colors.primary,
    },
    toggleText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    activeToggleText: {
        color: colors.white,
    },
    passwordContainer: {
        position: 'relative',
        marginTop: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: '2%',
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginVertical: 16,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        marginTop: 16,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signupText: {
        color: colors.text,
        fontSize: 14,
    },
    signupLink: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});

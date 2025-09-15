import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Input from '~/components/form/Input';
import Button from '~/components/form/Button';
import { colors } from '~/colors/Colors';
import axios from 'axios';

import { useNavigation, useRoute } from '@react-navigation/native';
import { FetchUserDetails } from '~/utils/api/Api';


export default function Edit_Profile() {
	const route = useRoute()
	const { id } = route.params || {}
	const [formData, setFormData] = useState({
		UserType: '',
		companyName: '',
		FullName: '',
		ContactNumber: '',
		Email: '',
		PinCode: null,
		HouseNo: '',
		address: '',
		panNo: '',
		gstNo: '',
		adharNo: '',

	});

	const navigation = useNavigation()
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const handleChange = (name: string, value: string) => {
		setFormData((prevData) => ({ ...prevData, [name]: value }));
	};

	const fetchUserOld = async () => {
		try {
			const data = await FetchUserDetails()

			if (data) {
				setFormData({
					UserType: data.userType,
					companyName: data.companyName,
					FullName: data.ownerName,
					ContactNumber: data.ContactNumber,
					PinCode: data.PinCode?.toString() || '',
					Email: data.Email,
					HouseNo: data.HouseNo,
					address: data.address,
					panNo: data.panNo,
					gstNo: data?.gstNo === 'undefined' ? '' : data?.gstNo,

					adharNo: data.adharNo,

				});

			}
		} catch (error) {
			console.log(error)
		}
	}
	useEffect(() => {
		fetchUserOld()
	}, [])
	const handleSubmit = async () => {
		setLoading(true);

		// Validation
		if (
			!formData.FullName ||
			!formData.ContactNumber ||
			!formData.Email ||
			!formData.HouseNo

		) {
			setErrorMessage('Please fill in all required fields.');
			setSuccessMessage('');
			setLoading(false);
			return;
		}

		try {
			const res = await axios.put(
				`https://api.blueaceindia.com/api/v1/update-vendor_app/${id}`,
				formData,
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			console.log('Response:', res.data);
			setSuccessMessage('Profile updated successfully!');
			navigation.navigate('Profile')
			// await FetchUserDetails()
		} catch (error: any) {
			console.log('Error:', error.response?.data?.msg || error.message);
			setErrorMessage(error.response?.data?.msg || 'Internal server error');
		} finally {
			setLoading(false);
		}
	};

	return (

		<ScrollView contentContainerStyle={styles.container}>

			<Input
				icon='account'
				placeholder="Full Name"
				value={formData.FullName}
				onChangeText={(value) => handleChange('FullName', value)}
			/>
			<Input
				icon='phone'
				placeholder="Contact Number"
				value={formData.ContactNumber}
				onChangeText={(value) => handleChange('ContactNumber', value)}
				keyboardType="phone-pad"
			/>
			<Input
				icon='mail'
				placeholder="Email"
				value={formData.Email}
				onChangeText={(value) => handleChange('Email', value)}
				keyboardType="email-address"
			/>
			<Input
				icon='office-building-marker'
				placeholder="Company Name"
				value={formData.companyName}
				onChangeText={(value) => handleChange('companyName', value)}
			/>
			<Input
				icon='alpha-p'
				placeholder="Pin Code"
				value={formData?.PinCode}
				onChangeText={(value) => handleChange('PinCode', value)}
				keyboardType="numeric"
			/>
			<Input
				icon='home'
				placeholder="House No"
				value={formData.HouseNo}
				onChangeText={(value) => handleChange('HouseNo', value)}
			/>

			<Input
				icon='file-document'
				placeholder="Gst No"
				value={formData.gstNo}
				onChangeText={(value) => handleChange('gstNo', value)}
			/>

			<Input
				icon='file-document'
				placeholder="Pan Details"
				value={formData.panNo}
				onChangeText={(value) => handleChange('address', value)}
			/>

			<Input
				icon='file-document'
				placeholder="Addhar details"
				value={formData.adharNo}
				onChangeText={(value) => handleChange('address', value)}
			/>



			{errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}


			{successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

			<Button
				onPress={handleSubmit}
				disabled={loading}
				variant='primary'
			>{loading ? 'Submiting...' : 'Submit'}</Button>
		</ScrollView>

	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: colors.white,
	},
	heading: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
		color: colors.black,
	},
	errorText: {
		color: colors.red,
		marginTop: 8,
		marginBottom: 8,
		fontSize: 14,
	},
	successText: {
		color: colors.green,
		marginTop: 8,
		marginBottom: 8,
		fontSize: 14,
	},

});

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

const OTPEmail = ({ email, pin, url }) => {
  return (
    <Html>
      <Head />
      <Preview>Secure Login Verification for {process.env.DOMAIN}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={company}>Secure Verification</Text>
          <Heading style={codeTitle}>Your Login Verification PIN</Heading>
          <Text style={codeDescription}>
            Hello , a login attempt was made for your account{" "}
          </Text>
          <Text style={pinCode}>
            Your PIN Code: <strong>{pin}</strong>
          </Text>
          <Text style={codeDescription}>
            Please enter this PIN in the login page to verify your identity.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OTPEmail;

const main = {
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  textAlign: "center",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #ddd",
  borderRadius: "5px",
  marginTop: "20px",
  width: "480px",
  maxWidth: "100%",
  margin: "0 auto",
  padding: "12% 6%",
};

const company = {
  fontWeight: "bold",
  fontSize: "18px",
  textAlign: "center",
};

const codeTitle = {
  textAlign: "center",
  fontSize: "24px",
  marginBottom: "20px",
};

const codeDescription = {
  textAlign: "center",
  fontSize: "16px",
  marginBottom: "20px",
};

const pinCode = {
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center",
  margin: "20px 0",
};

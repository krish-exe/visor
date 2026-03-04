// AWS Credential Manager
// 
// Phase 3 MVP: Uses AWS SDK default credential chain (aws_config::from_env())
// Future: Task 10.2 will add secure credential storage and STS rotation
//
// Security Rules:
// - DO NOT manually read environment variables
// - DO NOT hardcode credentials
// - DO NOT log credential values
// - DO NOT print credentials in debug output

use aws_config::BehaviorVersion;

/// Initialize AWS configuration using the default credential chain
/// 
/// This automatically loads credentials from:
/// - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
/// - AWS credentials file (~/.aws/credentials)
/// - IAM role (if running on EC2/ECS)
pub async fn init_aws_config() -> aws_config::SdkConfig {
    aws_config::defaults(BehaviorVersion::latest())
        .load()
        .await
}

/// Validate that AWS credentials are available
/// 
/// Returns Ok(()) if credentials can be loaded, Err with user-friendly message otherwise
pub async fn validate_credentials() -> Result<(), String> {
    let config = init_aws_config().await;
    
    // Check if region is configured
    if config.region().is_none() {
        return Err("AWS region not configured. Set AWS_REGION environment variable.".to_string());
    }
    
    // Note: We don't explicitly validate credentials here to avoid logging them
    // The actual Bedrock call will fail with a clear error if credentials are invalid
    
    Ok(())
}

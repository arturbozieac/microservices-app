package app.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import app.model.challenge.ChallengeAttempt;
import app.model.challenge.dto.ChallengeAttemptDTO;
import app.model.user.User;
import app.repositories.ChallengeAttemptRepository;
import app.repositories.UserRepository;
import app.services.interfaces.ChallengeService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class ChallengeServiceImpl implements ChallengeService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ChallengeAttemptRepository attemptRepository;

  public ChallengeAttempt verifyAttempt(ChallengeAttemptDTO attemptDTO) {
    // Check if the user already exists for that alias, otherwise create it
    User user = userRepository.findByAlias(attemptDTO.getUserAlias()).orElseGet(() -> {
      log.info("Creating new user with alias {}", attemptDTO.getUserAlias());
      return userRepository.save(User.builder().alias(attemptDTO.getUserAlias()).build()); 
    });
    // Check if the attempt is correct
    boolean isCorrect = attemptDTO.getGuess() == attemptDTO.getFactorA() * attemptDTO.getFactorB();
    // Builds the domain object. Null id since it'll be generated by the DB.
    ChallengeAttempt checkedAttempt = new ChallengeAttempt(null, user, attemptDTO.getFactorA(),
        attemptDTO.getFactorB(), attemptDTO.getGuess(), isCorrect);
    // Stores the attempt
    return attemptRepository.save(checkedAttempt);
  }
  
  @Override
  public List<ChallengeAttempt> getStatsForUser(String userAlias) {
    return attemptRepository.findTop10ByUserAliasOrderByIdDesc(userAlias);
  }
}
